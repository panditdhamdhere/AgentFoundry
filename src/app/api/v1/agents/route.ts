import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  REGISTRY_ADDRESSES,
  CHAIN_BY_ID,
  isChainSupported,
  CHAIN_NAMES,
} from "@/lib/constants";
import { REGISTRY_ABI } from "@/lib/registry";
import {
  fetchAgentMetadata,
  getVerificationStatus,
  hasProtocol,
  matchesSearch,
} from "@/lib/agent-utils";
import type { AgentCard } from "@/lib/types";
import { getRpcUrlForChain } from "@/lib/env";
import { getIndexedAgents } from "@/lib/agent-index";

/** Fetch recent Registered events for a chain (raw RPC). */
async function fetchRecentRegistrations(
  chainId: number,
  limit: number
): Promise<Array<{ agentId: string; owner: string; blockNumber: number }>> {
  const registry = REGISTRY_ADDRESSES[chainId];
  const chain = CHAIN_BY_ID[chainId];
  if (!registry || !chain || !isChainSupported(chainId)) return [];

  const rpcUrl = getRpcUrlForChain(chainId);
  const client = createPublicClient({
    chain,
    transport: rpcUrl ? http(rpcUrl) : http(),
  });

  const blockNumber = await client.getBlockNumber();
  const chunkSize = 2000;
  const results: Array<{ agentId: string; owner: string; blockNumber: number }> = [];

  for (let i = 0; i < 20; i++) {
    const toBlock = blockNumber - BigInt(i * chunkSize);
    const fromBlock = toBlock - BigInt(chunkSize) + BigInt(1);
    if (fromBlock < BigInt(0)) break;

    const logs = await client.getLogs({
      address: registry,
      event: parseAbiItem(
        "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)"
      ),
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      if (log.args.agentId != null && log.args.owner) {
        results.push({
          agentId: String(log.args.agentId),
          owner: log.args.owner,
          blockNumber: Number(log.blockNumber ?? 0),
        });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

export async function GET(request: Request) {
  const rate = await checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }

  const { searchParams } = new URL(request.url);
  const chainIdParam = searchParams.get("chainId");
  const chainId = chainIdParam ? parseInt(chainIdParam, 10) : 84532;
  const protocol = searchParams.get("protocol") ?? "";
  const search = searchParams.get("search") ?? "";
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "30", 10) || 30,
    50
  );

  if (!isChainSupported(chainId)) {
    return NextResponse.json(
      { error: `Unsupported chain: ${chainId}` },
      { status: 400 }
    );
  }

  try {
    let agents: Array<{
      chainId: number;
      agentId: string;
      owner: string;
      blockNumber: number;
      tokenURI: string | null;
      metadata: AgentCard | null;
      verification: { uriSet: boolean; schemaValid: boolean };
      chainName: string;
    }> = [];

    const indexed = await getIndexedAgents(chainId);
    if (indexed.length > 0) {
      agents = indexed.map((a) => ({
        chainId,
        agentId: a.agentId,
        owner: a.owner,
        blockNumber: a.blockNumber,
        tokenURI: a.tokenURI,
        metadata: a.metadata,
        verification: a.verification,
        chainName: a.chainName,
      }));
    } else {
      const registrations = await fetchRecentRegistrations(chainId, limit * 3);
      const registry = REGISTRY_ADDRESSES[chainId];
      const chain = CHAIN_BY_ID[chainId];
      const rpcUrl = getRpcUrlForChain(chainId);
      const client = createPublicClient({
        chain: chain!,
        transport: rpcUrl ? http(rpcUrl) : http(),
      });

      const tokenUris = await client.multicall({
        contracts: registrations.slice(0, limit * 2).map((reg) => ({
          address: registry!,
          abi: REGISTRY_ABI,
          functionName: "tokenURI" as const,
          args: [BigInt(reg.agentId)] as const,
        })),
        allowFailure: true,
      });

      const metadataPromises = registrations.slice(0, limit * 2).map(
        async (reg, i) => {
          const result = tokenUris[i];
          const tokenURI =
            result?.status === "success" && result.result
              ? String(result.result)
              : null;

          const metadata = tokenURI ? await fetchAgentMetadata(tokenURI) : null;

          if (protocol && !hasProtocol(metadata, protocol)) return null;
          if (search && !matchesSearch(metadata, search, reg.agentId))
            return null;

          const verification = getVerificationStatus(tokenURI, metadata);

          return {
            chainId,
            agentId: reg.agentId,
            owner: reg.owner,
            blockNumber: reg.blockNumber,
            tokenURI,
            metadata,
            verification,
            chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
          };
        }
      );

      const results = await Promise.all(metadataPromises);
      for (const r of results) {
        if (r) agents.push(r);
      }
      agents.sort((a, b) => b.blockNumber - a.blockNumber);
    }

    if (protocol || search) {
      agents = agents.filter((a) => {
        if (protocol && !hasProtocol(a.metadata, protocol)) return false;
        if (search && !matchesSearch(a.metadata, search, a.agentId)) return false;
        return true;
      });
    }

    const limited = agents.slice(0, limit);

    return NextResponse.json({
      agents: limited,
      chainId,
      chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
    });
  } catch (error) {
    console.error("Agents directory error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
