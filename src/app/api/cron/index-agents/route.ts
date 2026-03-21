/**
 * Cron job to index agent registrations into Redis for fast directory queries.
 * Call periodically (e.g. every 5–15 min) via Vercel Cron or external scheduler.
 * Protected by CRON_SECRET when set.
 */

import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
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
} from "@/lib/agent-utils";
import type { AgentCard } from "@/lib/types";
import { getRpcUrlForChain } from "@/lib/env";
import { setIndexedAgents, type IndexedAgent } from "@/lib/agent-index";

const MAX_AGENTS_PER_RUN = 200;
const DEFAULT_CHAIN_ID = 84532; // Base Sepolia

async function fetchRegistrationsFromRpc(
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
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chainIdParam = searchParams.get("chainId");
  const chainId = chainIdParam ? parseInt(chainIdParam, 10) : DEFAULT_CHAIN_ID;

  if (!isChainSupported(chainId)) {
    return NextResponse.json(
      { error: `Unsupported chain: ${chainId}` },
      { status: 400 }
    );
  }

  const registry = REGISTRY_ADDRESSES[chainId];
  const chain = CHAIN_BY_ID[chainId];
  if (!registry || !chain) {
    return NextResponse.json({ error: "Registry not configured" }, { status: 500 });
  }

  try {
    const registrations = await fetchRegistrationsFromRpc(
      chainId,
      MAX_AGENTS_PER_RUN
    );

    const rpcUrl = getRpcUrlForChain(chainId);
    const client = createPublicClient({
      chain,
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    const tokenUris = await client.multicall({
      contracts: registrations.map((reg) => ({
        address: registry,
        abi: REGISTRY_ABI,
        functionName: "tokenURI" as const,
        args: [BigInt(reg.agentId)] as const,
      })),
      allowFailure: true,
    });

    const agents: IndexedAgent[] = [];

    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i];
      const result = tokenUris[i];
      const tokenURI =
        result?.status === "success" && result.result
          ? String(result.result)
          : null;
      const metadata = tokenURI ? await fetchAgentMetadata(tokenURI) : null;
      const verification = getVerificationStatus(tokenURI, metadata);

      agents.push({
        agentId: reg.agentId,
        owner: reg.owner,
        blockNumber: reg.blockNumber,
        tokenURI,
        metadata,
        verification,
        chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
      });
    }

    agents.sort((a, b) => b.blockNumber - a.blockNumber);
    await setIndexedAgents(chainId, agents);

    return NextResponse.json({
      ok: true,
      chainId,
      indexed: agents.length,
    });
  } catch (error) {
    console.error("Index agents cron error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Indexing failed",
      },
      { status: 500 }
    );
  }
}
