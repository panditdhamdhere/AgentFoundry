"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CHAIN_NAMES, SUPPORTED_CHAINS } from "@/lib/constants";
import { CopyButton } from "@/components/copy-button";

interface MCPServer {
  name: string;
  endpoint: string;
  agentId: string;
  chainId: number;
  chainName: string;
  agentRegistry: string;
  description?: string;
}

export default function MCPDiscoveryPage() {
  const [chainId, setChainId] = useState(84532);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/mcp-discovery?chainId=${chainId}&limit=50`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => setServers(data.servers ?? []))
      .catch(() => setError("Failed to load MCP servers"))
      .finally(() => setLoading(false));
  }, [chainId]);

  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">MCP Discovery</h1>
          <p className="page-description">
            Discover ERC-8004 agents with Model Context Protocol (MCP) endpoints.
            Use these in MCP clients like Claude Desktop, Cline, or other AI tools.
          </p>
        </div>

        <div className="card-base mb-6 flex flex-wrap gap-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Chain
            </label>
            <select
              value={chainId}
              onChange={(e) => setChainId(parseInt(e.target.value, 10))}
              className="input-base"
            >
              {SUPPORTED_CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-base p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">
            Discovery API
          </h2>
          <p className="mb-3 text-xs text-zinc-500">
            MCP clients can fetch the list programmatically:
          </p>
          <code className="block overflow-x-auto rounded-lg bg-zinc-950 px-3 py-2 text-xs text-teal-400">
            GET /api/v1/mcp-discovery?chainId={chainId}
          </code>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="mt-6 text-zinc-500">Loading MCP servers…</p>
        ) : servers.length === 0 ? (
          <div className="mt-6 card-base p-12 text-center">
            <p className="text-zinc-500">
              No MCP servers found on {CHAIN_NAMES[chainId] ?? chainId}.
              Try another chain or register an agent with an MCP service.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {servers.map((s, i) => (
              <li
                key={`${s.agentId}-${s.endpoint}-${i}`}
                className="flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-100">{s.name}</p>
                  <p className="font-mono text-sm text-teal-400">{s.endpoint}</p>
                  {s.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                      {s.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-600">
                    {s.chainName} · Agent #{s.agentId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton
                    text={s.endpoint}
                    label="Copy endpoint"
                    className="text-xs font-medium text-zinc-500 hover:text-teal-400"
                  />
                  <Link
                    href={`/agent/${s.chainId}/${s.agentId}`}
                    className="text-xs font-medium text-teal-400 hover:text-teal-300"
                  >
                    View agent →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-12 text-center text-sm text-zinc-500">
          <Link href="/" className="font-medium text-teal-400 transition-colors hover:text-teal-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
