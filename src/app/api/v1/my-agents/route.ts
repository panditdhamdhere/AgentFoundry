import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  REGISTRY_ADDRESSES,
  CHAIN_BY_ID,
  SUPPORTED_CHAINS,
} from "@/lib/constants";
import { REGISTRY_ABI } from "@/lib/registry";
import { fetchAgentMetadata, getVerificationStatus } from "@/lib/agent-utils";
import { getRpcUrlForChain } from "@/lib/env";

async function fetchReputation(
  chainId: number,
  agentId: string,
  request: Request
): Promise<{ count: number; summaryValue: number }> {
  try {
    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;
    const res = await fetch(
      `${base}/api/v1/reputation?agentId=${agentId}&chainId=${chainId}`
    );
    if (!res.ok) return { count: 0, summaryValue: 0 };
    const data = await res.json();
    return {
      count: data.count ?? 0,
      summaryValue: data.summaryValue ?? 0,
    };
  } catch {
    return { count: 0, summaryValue: 0 };
  }
}

async function fetchAgentsForChain(
  address: string,
  chainId: number
): Promise<Array<{ chainId: number; agentId: string }>> {
  const registry = REGISTRY_ADDRESSES[chainId];
  const chain = CHAIN_BY_ID[chainId];
  if (!registry || !chain) return [];

  const rpcUrl = getRpcUrlForChain(chainId);
  const client = createPublicClient({
    chain,
    transport: rpcUrl ? http(rpcUrl) : http(),
  });

  const blockNumber = await client.getBlockNumber();
  const chunkSize = 2000;
  const maxChunks = 150;
  const allLogs: Array<{ args: { agentId?: bigint } }> = [];

  for (let i = 0; i < maxChunks; i++) {
    const toBlock = blockNumber - BigInt(i * chunkSize);
    const fromBlock = toBlock - BigInt(chunkSize) + BigInt(1);
    if (fromBlock < 0) break;

    const logs = await client.getLogs({
      address: registry,
      event: parseAbiItem(
        "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)"
      ),
      args: { owner: address as `0x${string}` },
      fromBlock,
      toBlock,
    });
    allLogs.push(...logs);
    if (fromBlock <= 0) break;
  }

  return allLogs
    .filter((log): log is { args: { agentId: bigint } } => log.args.agentId != null)
    .map((log) => ({
      chainId,
      agentId: String(log.args.agentId),
    }));
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
  const address = searchParams.get("address");
  const chainIdsParam = searchParams.get("chainIds");
  const includeReputation =
    searchParams.get("includeReputation") === "1" ||
    searchParams.get("includeReputation") === "true";
  const includeVerification =
    searchParams.get("includeVerification") === "1" ||
    searchParams.get("includeVerification") === "true";

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const chainIds: number[] =
    chainIdsParam === "all" || !chainIdsParam
      ? SUPPORTED_CHAINS.map((c) => c.id)
      : chainIdsParam
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((id) => !isNaN(id) && id in REGISTRY_ADDRESSES);

  if (chainIds.length === 0) {
    return NextResponse.json({ agents: [] });
  }

  try {
    const results = await Promise.allSettled(
      chainIds.map((chainId) => fetchAgentsForChain(address, chainId))
    );

    const agents: Array<{ chainId: number; agentId: string }> = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        agents.push(...result.value);
      }
    }

    if ((includeReputation || includeVerification) && agents.length > 0) {
      const withExtras = await Promise.all(
        agents.map(async (a) => {
          const [rep, verification] = await Promise.all([
            includeReputation
              ? fetchReputation(a.chainId, a.agentId, request)
              : null,
            includeVerification
              ? (async () => {
                  const chain = CHAIN_BY_ID[a.chainId];
                  const registry = REGISTRY_ADDRESSES[a.chainId];
                  if (!chain || !registry) return null;
                  const rpcUrl = getRpcUrlForChain(a.chainId);
                  const client = createPublicClient({
                    chain,
                    transport: rpcUrl ? http(rpcUrl) : http(),
                  });
                  let tokenURI: string | null = null;
                  try {
                    const uri = await client.readContract({
                      address: registry,
                      abi: REGISTRY_ABI,
                      functionName: "tokenURI",
                      args: [BigInt(a.agentId)],
                    });
                    if (uri) tokenURI = String(uri);
                  } catch {
                    /* ignore */
                  }
                  const metadata = tokenURI
                    ? await fetchAgentMetadata(tokenURI)
                    : null;
                  return getVerificationStatus(tokenURI, metadata);
                })()
              : null,
          ]);
          return {
            ...a,
            ...(rep && { reputation: rep }),
            ...(verification && { verification }),
          };
        })
      );
      return NextResponse.json({ agents: withExtras });
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("my-agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
