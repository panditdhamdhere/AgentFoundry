import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { checkRateLimit } from "@/lib/rate-limit";
import { baseSepolia } from "viem/chains";
import { REGISTRY_ADDRESSES } from "@/lib/constants";

function getRpcUrl(chainId: number): string | undefined {
  if (chainId === 84532) return process.env.NODE_RPC_URL_BASE_SEPOLIA;
  if (chainId === 1) return process.env.NODE_RPC_URL_MAINNET;
  return undefined;
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
  const address = searchParams.get("address");
  const chainIdParam = searchParams.get("chainId");
  const chainId = chainIdParam ? parseInt(chainIdParam, 10) : 84532;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const registry = REGISTRY_ADDRESSES[chainId];
  if (!registry) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  if (chainId !== 84532) {
    return NextResponse.json(
      { error: "Only Base Sepolia (84532) supported" },
      { status: 400 }
    );
  }

  try {
    const rpcUrl = getRpcUrl(chainId);
    const client = createPublicClient({
      chain: baseSepolia,
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    const blockNumber = await client.getBlockNumber();
    const chunkSize = 2000; // RPC-friendly; many providers limit to ~2k blocks
    const maxChunks = 150; // ~300k blocks (recent registrations)
    const allLogs: Array<{ args: { agentId?: bigint } }> = [];

    // Fetch from newest to oldest so we get recent registrations first
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

    const agents = allLogs
      .filter((log): log is { args: { agentId: bigint } } => log.args.agentId != null)
      .map((log) => ({
        chainId,
        agentId: String(log.args.agentId),
      }));

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("my-agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
