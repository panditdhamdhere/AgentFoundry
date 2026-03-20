"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { useUserAgents } from "@/hooks/use-user-agents";
import { getAgentExplorerUrl, CHAIN_NAMES } from "@/lib/constants";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { agents, isLoading, isFetching, error, refetch } = useUserAgents();

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
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Your Agents
                </h2>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isLoading || isFetching}
                  className="text-xs font-medium text-teal-400 hover:text-teal-300 disabled:opacity-50"
                >
                  {isLoading ? "Loading…" : isFetching ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-400">
                  {error.message}. Try refreshing or check the console.
                </p>
              )}

              {isLoading ? (
                <p className="mt-4 text-sm text-zinc-500">Loading agents…</p>
              ) : agents.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/20 p-8 text-center">
                  <p className="text-zinc-500">
                    No agents yet. Register one to get started.
                  </p>
                  <Link href="/register" className="btn-primary mt-4 inline-block">
                    Create your first agent
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {agents.map((agent, i) => {
                    const chainName =
                      CHAIN_NAMES[agent.chainId] ?? `Chain ${agent.chainId}`;
                    const scanUrl = getAgentExplorerUrl(agent.chainId, agent.agentId);
                    return (
                      <li
                        key={`${agent.chainId}-${agent.agentId}-${i}`}
                        className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3"
                      >
                        <div>
                          <p className="font-mono text-sm font-medium text-zinc-100">
                            Agent #{agent.agentId}
                          </p>
                          <p className="text-xs text-zinc-500">{chainName}</p>
                        </div>
                        <a
                          href={scanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          View on Explorer →
                        </a>
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
