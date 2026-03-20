"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { AgentForm } from "@/components/agent-form";
import { ChainBadge } from "@/components/chain-badge";

export default function RegisterPage() {
  const { isConnected } = useAccount();

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
            Create Agent
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-500">
            Give your AI agent an on-chain identity with ERC-8004. Connect your
            wallet and fill in the details below.
          </p>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center shadow-xl shadow-black/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
              <span className="text-2xl">◈</span>
            </div>
            <p className="text-zinc-400">
              Connect your wallet to register an agent. Supports 40+ chains:
              Base, Ethereum, Polygon, Arbitrum, Optimism, and more.
            </p>
            <p className="mt-5 text-sm text-zinc-500">
              Need testnet ETH?{" "}
              <a
                href="https://www.alchemy.com/faucets/base-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-400 transition-colors hover:text-teal-300"
              >
                Get some from Alchemy
              </a>
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl shadow-black/20">
            <AgentForm
              onSuccess={() => {
                // Optional: redirect or show toast
              }}
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
