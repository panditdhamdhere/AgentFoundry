import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  REGISTRY_ADDRESSES,
  CHAIN_BY_ID,
  isChainSupported,
  CHAIN_NAMES,
} from "@/lib/constants";

function isValidChainId(id: number): boolean {
  return !isNaN(id) && isChainSupported(id);
}

function getRpcUrl(chainId: number): string | undefined {
  if (chainId === 84532) return process.env.NODE_RPC_URL_BASE_SEPOLIA;
  if (chainId === 1) return process.env.NODE_RPC_URL_MAINNET;
  return undefined;
}

/** Fetch recent Registered events for activity feed */
async function fetchRecentForChain(
  chainId: number,
  limit: number
): Promise<
  Array<{ chainId: number; agentId: string; owner: string; blockNumber: number }>
> {
  const registry = REGISTRY_ADDRESSES[chainId];
  const chain = CHAIN_BY_ID[chainId];
  if (!registry || !chain || !isChainSupported(chainId)) return [];

  const rpcUrl = getRpcUrl(chainId);
  const client = createPublicClient({
    chain,
    transport: rpcUrl ? http(rpcUrl) : http(),
  });

  const blockNumber = await client.getBlockNumber();
  const chunkSize = 2000;
  const results: Array<{
    chainId: number;
    agentId: string;
    owner: string;
    blockNumber: number;
  }> = [];

  for (let i = 0; i < 5; i++) {
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
          chainId,
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
      {
        status: 429,
        headers: rate.retryAfter
          ? { "Retry-After": String(rate.retryAfter) }
          : undefined,
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "15", 10) || 15,
    30
  );
  const chainIdsParam = searchParams.get("chainIds");
  const chainIds: number[] = chainIdsParam
    ? chainIdsParam
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter(isValidChainId)
    : [84532, 8453];

  try {
    const all = await Promise.all(
      chainIds.map((cid) => fetchRecentForChain(cid, limit))
    );

    const merged = all.flat();
    merged.sort((a, b) => b.blockNumber - a.blockNumber);
    const items = merged.slice(0, limit).map((item) => ({
      ...item,
      chainName: CHAIN_NAMES[item.chainId] ?? `Chain ${item.chainId}`,
      ownerShort: `${item.owner.slice(0, 6)}…${item.owner.slice(-4)}`,
    }));

    return NextResponse.json({ activity: items });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch activity",
      },
      { status: 500 }
    );
  }
}
