"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useUserAgents } from "@/hooks/use-user-agents";
import {
  getAgentExplorerUrl,
  getErc8004Identifier,
  CHAIN_NAMES,
  SUPPORTED_CHAINS,
} from "@/lib/constants";
import { CopyButton } from "@/components/copy-button";
import { VerificationBadge } from "@/components/verification-badge";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { agents, isLoading, isFetching, error, refetch } = useUserAgents();
  const [chainFilter, setChainFilter] = useState<number | "all">("all");

  const filteredAgents = useMemo(() => {
    if (chainFilter === "all") return agents;
    return agents.filter((a) => a.chainId === chainFilter);
  }, [agents, chainFilter]);

  const chainsWithAgents = useMemo(() => {
    const ids = new Set(agents.map((a) => a.chainId));
    return SUPPORTED_CHAINS.filter((c) => ids.has(c.id));
  }, [agents]);

  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            View and manage your registered agents.
          </p>
        </div>

        {!isConnected ? (
          <div className="card-base p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
              <span className="text-3xl">◈</span>
            </div>
            <p className="text-zinc-400">
              Connect your wallet to view your agents.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card-base p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Your Wallet
              </h2>
              <p className="mt-2 font-mono text-sm text-zinc-300">{address}</p>
            </div>

            <div className="card-base p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Your Agents
                </h2>
                <div className="flex items-center gap-2">
                  {agents.length > 0 && (
                    <select
                      value={chainFilter}
                      onChange={(e) =>
                        setChainFilter(
                          e.target.value === "all"
                            ? "all"
                            : parseInt(e.target.value, 10)
                        )
                      }
                      className="rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-300 focus:border-teal-500/50 focus:outline-none"
                    >
                      <option value="all">All chains</option>
                      {chainsWithAgents.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isLoading || isFetching}
                    className="text-xs font-medium text-teal-400 hover:text-teal-300 disabled:opacity-50"
                  >
                    {isLoading ? "Loading…" : isFetching ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-400">
                  {error.message}. Try refreshing or check the console.
                </p>
              )}

              {isLoading ? (
                <p className="mt-4 text-sm text-zinc-500">Loading agents…</p>
              ) : filteredAgents.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/20 p-8 text-center">
                  <p className="text-zinc-500">
                    {agents.length === 0
                      ? "No agents yet. Register one to get started."
                      : `No agents on ${chainFilter === "all" ? "any chain" : CHAIN_NAMES[chainFilter] ?? "selected chain"}.`}
                  </p>
                  <Link
                    href="/register"
                    className="btn-primary mt-4 inline-block"
                  >
                    {agents.length === 0 ? "Create your first agent" : "Create agent"}
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {filteredAgents.map((agent, i) => {
                    const chainName =
                      CHAIN_NAMES[agent.chainId] ?? `Chain ${agent.chainId}`;
                    const scanUrl = getAgentExplorerUrl(agent.chainId, agent.agentId);
                    const feedbackUrl = `/feedback?agentId=${agent.agentId}&chainId=${agent.chainId}`;
                    const detailUrl = `/agent/${agent.chainId}/${agent.agentId}`;
                    const identifier = getErc8004Identifier(
                      agent.chainId,
                      agent.agentId
                    );
                    return (
                      <li
                        key={`${agent.chainId}-${agent.agentId}-${i}`}
                        className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-medium text-zinc-100">
                              Agent #{agent.agentId}
                            </p>
                            {agent.verification && (
                              <VerificationBadge
                                uriSet={agent.verification.uriSet}
                                schemaValid={agent.verification.schemaValid}
                              />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            {chainName}
                            {agent.reputation && agent.reputation.count > 0 && (
                              <span className="ml-2 text-teal-400">
                                · {agent.reputation.count} feedback
                                {agent.reputation.count !== 1 ? "s" : ""}
                                {agent.reputation.summaryValue !== 0 && (
                                  <> (avg: {agent.reputation.summaryValue})</>
                                )}
                              </span>
                            )}
                          </p>
                          <CopyButton
                            text={identifier}
                            label="Copy identifier"
                            className="mt-1.5 text-xs font-medium text-zinc-500 hover:text-teal-400"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={detailUrl}
                            className="btn-secondary text-sm"
                          >
                            View details
                          </Link>
                          <Link
                            href={feedbackUrl}
                            className="rounded-lg border border-zinc-700/80 bg-zinc-800/40 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60 hover:text-zinc-100"
                          >
                            Give feedback
                          </Link>
                          <a
                            href={scanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm"
                          >
                            Explorer →
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
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
