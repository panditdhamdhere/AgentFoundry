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
        ) : !agentId ? (
          <div className="card-base p-10 text-center">
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
              <code className="text-teal-400">/feedback?agentId=1&chainId=84532</code>
            </p>
          </div>
        ) : (
          <div className="card-base p-8">
            <div className="mb-6">
              <p className="text-sm font-medium text-zinc-500">
                Agent #{agentId} on chain {chainId}
              </p>
            </div>
            <FeedbackForm agentId={agentId} chainId={chainId} />
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
