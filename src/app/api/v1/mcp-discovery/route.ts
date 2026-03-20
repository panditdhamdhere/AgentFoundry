import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { CHAIN_NAMES, getErc8004Identifier } from "@/lib/constants";
import type { AgentCard } from "@/lib/types";

/**
 * MCP Discovery API - returns agents with MCP endpoints for Model Context Protocol clients.
 * GET /api/v1/mcp-discovery?chainId=84532&limit=50
 */
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
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);

  try {
    const { isChainSupported } = await import("@/lib/constants");
    if (!isChainSupported(chainId)) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chainId}` },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const base = url.origin;
    const res = await fetch(
      `${base}/api/v1/agents?chainId=${chainId}&protocol=MCP&limit=${limit}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err, { status: res.status });
    }

    const { agents } = await res.json();

    const mcpServers: Array<{
      name: string;
      endpoint: string;
      agentId: string;
      chainId: number;
      chainName: string;
      agentRegistry: string;
      description?: string;
    }> = [];

    for (const a of agents ?? []) {
      const meta = a.metadata as AgentCard | null;
      if (!meta?.services?.length) continue;

      const mcpServices = meta.services.filter(
        (s: { name?: string }) =>
          s.name?.toLowerCase().includes("mcp")
      );

      for (const svc of mcpServices) {
        if (svc.endpoint?.trim()) {
          mcpServers.push({
            name: meta.name || `Agent #${a.agentId}`,
            endpoint: svc.endpoint.trim(),
            agentId: a.agentId,
            chainId: a.chainId,
            chainName: CHAIN_NAMES[a.chainId] ?? `Chain ${a.chainId}`,
            agentRegistry: getErc8004Identifier(a.chainId, a.agentId),
            description: meta.description || undefined,
          });
        }
      }
    }

    return NextResponse.json({
      servers: mcpServers,
      chainId,
      chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
    });
  } catch (error) {
    console.error("MCP discovery error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch MCP servers" },
      { status: 500 }
    );
  }
}
