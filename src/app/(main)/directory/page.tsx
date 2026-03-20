"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CHAIN_NAMES,
  SUPPORTED_CHAINS,
  getAgentExplorerUrl,
} from "@/lib/constants";
import { VerificationBadge } from "@/components/verification-badge";

interface DirectoryAgent {
  chainId: number;
  agentId: string;
  owner: string;
  tokenURI: string | null;
  metadata: { name?: string; description?: string; services?: Array<{ name: string; endpoint: string }> } | null;
  verification: { uriSet: boolean; schemaValid: boolean };
  chainName: string;
}

const PROTOCOL_OPTIONS = ["", "MCP", "A2A", "OASF"];

export default function DirectoryPage() {
  const [chainId, setChainId] = useState(84532);
  const [protocol, setProtocol] = useState("");
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<DirectoryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("chainId", String(chainId));
    params.set("limit", "30");
    if (protocol) params.set("protocol", protocol);
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/v1/agents?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load agents");
        return res.json();
      })
      .then((data) => setAgents(data.agents ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [chainId, protocol, search]);

  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">Agent Directory</h1>
          <p className="page-description">
            Browse ERC-8004 agents by chain. Filter by protocol (MCP, A2A, OASF)
            or search by name and endpoint.
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
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Protocol
            </label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="input-base"
            >
              {PROTOCOL_OPTIONS.map((p) => (
                <option key={p || "all"} value={p}>
                  {p || "All"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, endpoint…"
              className="input-base w-full"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="text-zinc-500">Loading agents…</p>
        ) : agents.length === 0 ? (
          <div className="card-base p-12 text-center">
            <p className="text-zinc-500">
              No agents found. Try a different chain or filter.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {agents.map((agent) => (
              <li
                key={`${agent.chainId}-${agent.agentId}`}
                className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium text-zinc-100">
                      {agent.metadata?.name ?? `Agent #${agent.agentId}`}
                    </p>
                    <VerificationBadge
                      uriSet={agent.verification.uriSet}
                      schemaValid={agent.verification.schemaValid}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    {agent.chainName} · Agent #{agent.agentId}
                  </p>
                  {agent.metadata?.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                      {agent.metadata.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/agent/${agent.chainId}/${agent.agentId}`}
                    className="btn-secondary text-sm"
                  >
                    View details
                  </Link>
                  <a
                    href={getAgentExplorerUrl(agent.chainId, agent.agentId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-zinc-700/80 bg-zinc-800/40 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60 hover:text-zinc-100"
                  >
                    Explorer →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-12 text-center text-sm text-zinc-500">
          <Link
            href="/"
            className="font-medium text-teal-400 transition-colors hover:text-teal-300"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
