import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import {
  VALIDATION_REGISTRY_ADDRESSES,
  hasValidationRegistry,
  isChainSupported,
  SUPPORTED_CHAINS,
} from "@/lib/constants";
import { env } from "@/lib/env";
import { VALIDATION_ABI } from "@/lib/validation-registry";

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

    if (!hasValidationRegistry(chainId) || !isChainSupported(chainId)) {
      return NextResponse.json({
        agentId,
        chainId,
        available: false,
        count: 0,
        averageResponse: 0,
        validations: [],
      });
    }

    const validationAddress = VALIDATION_REGISTRY_ADDRESSES[chainId];
    if (!validationAddress) {
      return NextResponse.json({
        agentId,
        chainId,
        available: false,
        count: 0,
        averageResponse: 0,
        validations: [],
      });
    }

    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) ?? SUPPORTED_CHAINS[0];
    const rpcUrl =
      chainId === 1 ? env.rpc.mainnet
      : chainId === 84532 ? env.rpc.baseSepolia
      : undefined;
    const client = createPublicClient({
      chain,
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    const requestHashes = await client.readContract({
      address: validationAddress,
      abi: VALIDATION_ABI,
      functionName: "getAgentValidations",
      args: [BigInt(agentId)],
    });

    if (requestHashes.length === 0) {
      const [count, averageResponse] = await client.readContract({
        address: validationAddress,
        abi: VALIDATION_ABI,
        functionName: "getSummary",
        args: [BigInt(agentId), [], ""],
      });
      return NextResponse.json({
        agentId,
        chainId,
        available: true,
        count: Number(count),
        averageResponse: Number(averageResponse),
        validations: [],
      });
    }

    const statuses = await Promise.all(
      requestHashes.map((hash) =>
        client.readContract({
          address: validationAddress,
          abi: VALIDATION_ABI,
          functionName: "getValidationStatus",
          args: [hash],
        })
      )
    );

    const validations = statuses.map((s, i) => ({
      requestHash: requestHashes[i],
      validatorAddress: s[0],
      agentId: Number(s[1]),
      response: Number(s[2]),
      tag: s[4],
      lastUpdate: Number(s[5]),
    }));

    const [count, averageResponse] = await client.readContract({
      address: validationAddress,
      abi: VALIDATION_ABI,
      functionName: "getSummary",
      args: [BigInt(agentId), [], ""],
    });

    return NextResponse.json({
      agentId,
      chainId,
      available: true,
      count: Number(count),
      averageResponse: Number(averageResponse),
      validations,
    });
  } catch (error) {
    console.error("Validation API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch validation",
      },
      { status: 500 }
    );
  }
}
