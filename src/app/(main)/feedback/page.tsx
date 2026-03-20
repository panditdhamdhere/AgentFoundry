"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { ChainBadge } from "@/components/chain-badge";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useUserAgents } from "@/hooks/use-user-agents";
import { CHAIN_NAMES } from "@/lib/constants";

function FeedbackContent() {
  const router = useRouter();
  const { isConnected, chain } = useAccount();
  const { agents } = useUserAgents();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");
  const chainIdParam = searchParams.get("chainId");
  const effectiveAgentId = agentId ?? null;
  const effectiveChainId = chainIdParam
    ? parseInt(chainIdParam, 10)
    : chain?.id ?? 84532;

  const handleSelectAgent = (a: { agentId: string; chainId: number }) => {
    router.replace(`/feedback?agentId=${a.agentId}&chainId=${a.chainId}`);
  };

  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-xl">
        <div className="page-header">
          {isConnected && (
            <div className="mb-5">
              <ChainBadge />
            </div>
          )}
          <h1 className="page-title">Give Feedback</h1>
          <p className="page-description">
            Submit reputation feedback for an ERC-8004 agent. You must have
            interacted with the agent as a client.
          </p>
        </div>

        {!isConnected ? (
          <div className="card-base p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
              <span className="text-3xl">◎</span>
            </div>
            <p className="text-zinc-400">
              Connect your wallet to give feedback.
            </p>
          </div>
        ) : !effectiveAgentId ? (
          <div className="card-base p-10">
            {agents.length > 0 ? (
              <>
                <p className="mb-4 text-sm text-zinc-400">
                  Select an agent from your dashboard, or add{" "}
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-teal-400">
                    ?agentId=123&chainId=84532
                  </code>{" "}
                  to the URL.
                </p>
                <div className="space-y-2">
                  {agents.map((a, i) => {
                    const chainName =
                      CHAIN_NAMES[a.chainId] ?? `Chain ${a.chainId}`;
                    return (
                      <button
                        key={`${a.chainId}-${a.agentId}-${i}`}
                        type="button"
                        onClick={() => handleSelectAgent(a)}
                        className="flex w-full items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 text-left transition-colors hover:border-teal-500/40 hover:bg-zinc-800/60"
                      >
                        <span className="font-mono text-sm font-medium text-zinc-100">
                          Agent #{a.agentId}
                        </span>
                        <span className="text-xs text-zinc-500">{chainName}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-zinc-400">
                  Add{" "}
                  <code className="rounded-lg bg-zinc-800 px-2 py-1 font-mono text-sm text-teal-400">
                    ?agentId=123
                  </code>{" "}
                  and optionally{" "}
                  <code className="rounded-lg bg-zinc-800 px-2 py-1 font-mono text-sm text-teal-400">
                    chainId=84532
                  </code>{" "}
                  to the URL.
                </p>
                <p className="mt-4 text-sm text-zinc-500">
                  Example:{" "}
                  <code className="text-teal-400">
                    /feedback?agentId=1&chainId=84532
                  </code>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="card-base p-8">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500">
                Agent #{effectiveAgentId} on chain {effectiveChainId}
              </p>
              {agents.length > 1 && (
                <button
                  type="button"
                  onClick={() => router.replace("/feedback")}
                  className="text-xs text-zinc-500 hover:text-teal-400"
                >
                  Change agent
                </button>
              )}
            </div>
            <FeedbackForm
              agentId={effectiveAgentId}
              chainId={effectiveChainId}
            />
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

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px]" />}>
      <FeedbackContent />
    </Suspense>
  );
}
