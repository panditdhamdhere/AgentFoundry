"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { FeedbackForm } from "@/components/feedback-form";
import { ChainBadge } from "@/components/chain-badge";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FeedbackContent() {
  const { isConnected, chain } = useAccount();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");
  const chainIdParam = searchParams.get("chainId");
  const chainId = chainIdParam ? parseInt(chainIdParam, 10) : chain?.id ?? 84532;

  return (
    <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-10">
          {isConnected && (
            <div className="mb-5">
              <ChainBadge />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Give Feedback
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-500">
            Submit reputation feedback for an ERC-8004 agent. You must have
            interacted with the agent as a client.
          </p>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center shadow-xl shadow-black/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
              <span className="text-2xl">◎</span>
            </div>
            <p className="text-zinc-400">
              Connect your wallet to give feedback.
            </p>
          </div>
        ) : !agentId ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center shadow-xl shadow-black/20">
            <p className="text-zinc-400">
              Add <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-teal-400">?agentId=123</code>{" "}
              and optionally{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-teal-400">chainId=84532</code>{" "}
              to the URL.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Example: <code className="text-teal-400">/feedback?agentId=1&chainId=84532</code>
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl shadow-black/20">
            <div className="mb-6">
              <p className="text-sm text-zinc-500">
                Agent #{agentId} on chain {chainId}
              </p>
            </div>
            <FeedbackForm
              agentId={agentId}
              chainId={chainId}
            />
          </div>
        )}

        <p className="mt-10 text-center text-sm text-zinc-500">
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
