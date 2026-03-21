import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import {
  REPUTATION_REGISTRY_ADDRESSES,
  isChainSupported,
  SUPPORTED_CHAINS,
} from "@/lib/constants";
import { getRpcUrlForChain } from "@/lib/env";
import { REPUTATION_ABI } from "@/lib/reputation-registry";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const chainIdParam = searchParams.get("chainId");
    const chainId = chainIdParam ? parseInt(chainIdParam, 10) : 84532;

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      );
    }

    const reputationAddress = REPUTATION_REGISTRY_ADDRESSES[chainId];
    if (!reputationAddress || !isChainSupported(chainId)) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chainId}` },
        { status: 400 }
      );
    }

    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) ?? SUPPORTED_CHAINS[0];
    const rpcUrl = getRpcUrlForChain(chainId);
    const client = createPublicClient({
      chain,
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    const clients = await client.readContract({
      address: reputationAddress,
      abi: REPUTATION_ABI,
      functionName: "getClients",
      args: [BigInt(agentId)],
    });

    if (clients.length === 0) {
      return NextResponse.json({
        agentId,
        chainId,
        count: 0,
        summaryValue: 0,
        summaryValueDecimals: 0,
        clients: [],
        feedback: [],
      });
    }

    const [count, summaryValue, summaryValueDecimals] = await client.readContract({
      address: reputationAddress,
      abi: REPUTATION_ABI,
      functionName: "getSummary",
      args: [BigInt(agentId), clients, "", ""],
    });

    const includeFeedback = searchParams.get("includeFeedback") === "true";
    let feedback: Array<{
      client: string;
      feedbackIndex: number;
      value: number;
      valueDecimals: number;
      tag1: string;
      tag2: string;
      isRevoked: boolean;
    }> = [];

    if (includeFeedback) {
      try {
        const [feedbackClients, feedbackIndexes, values, valueDecimals, tag1s, tag2s, revokedStatuses] =
          await client.readContract({
            address: reputationAddress,
            abi: REPUTATION_ABI,
            functionName: "readAllFeedback",
            args: [BigInt(agentId), clients, "", "", false],
          });
        feedback = (feedbackClients as string[]).flatMap((clientAddr, i) => {
          const idx = Number(feedbackIndexes[i]);
          const val = Number(values[i]);
          const dec = valueDecimals[i];
          const displayValue = dec > 0 ? val / Math.pow(10, dec) : val;
          return {
            client: clientAddr,
            feedbackIndex: idx,
            value: displayValue,
            valueDecimals: dec,
            tag1: tag1s[i] ?? "",
            tag2: tag2s[i] ?? "",
            isRevoked: revokedStatuses[i] ?? false,
          };
        });
      } catch {
        // readAllFeedback failed - continue without feedback list
      }
    }

    return NextResponse.json({
      agentId,
      chainId,
      count: Number(count),
      summaryValue: Number(summaryValue),
      summaryValueDecimals,
      clients: clients as string[],
      feedback,
    });
  } catch (error) {
    console.error("Reputation API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch reputation",
      },
      { status: 500 }
    );
  }
}
