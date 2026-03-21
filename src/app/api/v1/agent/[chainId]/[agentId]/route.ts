import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import {
  REGISTRY_ADDRESSES,
  CHAIN_BY_ID,
  isChainSupported,
} from "@/lib/constants";
import { REGISTRY_ABI } from "@/lib/registry";
import { getVerificationStatus } from "@/lib/agent-utils";
import { env, getRpcUrlForChain } from "@/lib/env";
import type { AgentCard } from "@/lib/types";

function resolveIpfsUrl(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "").split("/")[0];
    const gateway =
      env.pinata.gateway || "https://gateway.pinata.cloud";
    const base = gateway.replace(/\/$/, "");
    return `${base}/ipfs/${cid}`;
  }
  return uri;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chainId: string; agentId: string }> }
) {
  try {
    const { chainId: chainIdStr, agentId } = await params;
    const chainId = parseInt(chainIdStr, 10);
    if (isNaN(chainId) || !agentId) {
      return NextResponse.json(
        { error: "Invalid chainId or agentId" },
        { status: 400 }
      );
    }

    const registry = REGISTRY_ADDRESSES[chainId];
    const chain = CHAIN_BY_ID[chainId];
    if (!registry || !chain || !isChainSupported(chainId)) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chainId}` },
        { status: 400 }
      );
    }

    const rpcUrl = getRpcUrlForChain(chainId);
    const client = createPublicClient({
      chain,
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    let tokenURI = "";
    let owner: string | null = null;
    let agentWallet: string | null = null;
    try {
      const [uriResult, ownerResult, walletResult] = await Promise.all([
        client.readContract({
          address: registry,
          abi: REGISTRY_ABI,
          functionName: "tokenURI",
          args: [BigInt(agentId)],
        }),
        client.readContract({
          address: registry,
          abi: REGISTRY_ABI,
          functionName: "ownerOf",
          args: [BigInt(agentId)],
        }).catch(() => null),
        client.readContract({
          address: registry,
          abi: REGISTRY_ABI,
          functionName: "getAgentWallet",
          args: [BigInt(agentId)],
        }).catch(() => null),
      ]);
      tokenURI = typeof uriResult === "string" ? uriResult : "";
      owner = ownerResult ? String(ownerResult) : null;
      const w = walletResult;
      agentWallet = w && typeof w === "string" && w !== "0x0000000000000000000000000000000000000000" ? w : null;
    } catch {
      // tokenURI may not be set or contract may use different interface
    }

    let metadata: AgentCard | null = null;
    if (tokenURI && (tokenURI.startsWith("ipfs://") || tokenURI.startsWith("http"))) {
      try {
        const url = tokenURI.startsWith("ipfs://")
          ? resolveIpfsUrl(tokenURI)
          : tokenURI;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const json = await res.json();
          if (json?.name) metadata = json as AgentCard;
        }
      } catch {
        // IPFS fetch failed - continue without metadata
      }
    }

    // Fetch reputation
    let reputation = {
      count: 0,
      summaryValue: 0,
      summaryValueDecimals: 0,
    };
    try {
      const url = new URL(request.url);
      const base = `${url.protocol}//${url.host}`;
      const repRes = await fetch(
        `${base}/api/v1/reputation?agentId=${agentId}&chainId=${chainId}`
      );
      if (repRes.ok) {
        const rep = await repRes.json();
        reputation = {
          count: rep.count ?? 0,
          summaryValue: rep.summaryValue ?? 0,
          summaryValueDecimals: rep.summaryValueDecimals ?? 0,
        };
      }
    } catch {
      // Reputation fetch failed
    }

    const verification = getVerificationStatus(
      tokenURI || null,
      metadata
    );

    return NextResponse.json({
      chainId,
      agentId,
      owner: owner ?? null,
      agentWallet: agentWallet ?? null,
      tokenURI: tokenURI || null,
      metadata,
      reputation,
      verification,
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch agent",
      },
      { status: 500 }
    );
  }
}
