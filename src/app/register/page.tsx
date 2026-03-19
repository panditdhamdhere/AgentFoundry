"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { AgentForm } from "@/components/agent-form";
import { ChainBadge } from "@/components/chain-badge";

export default function RegisterPage() {
  const { isConnected } = useAccount();

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
      <div className="mb-8">
        {isConnected && (
          <div className="mb-4">
            <ChainBadge />
          </div>
        )}
        <h1 className="text-2xl font-bold sm:text-3xl">Create Agent</h1>
        <p className="mt-2 text-zinc-500">
          Give your AI agent an on-chain identity with ERC-8004. Connect your
          wallet and fill in the details below.
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">
            Connect your wallet to register an agent. Supports 40+ chains:
            Base, Ethereum, Polygon, Arbitrum, Optimism, and more.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Need testnet ETH?{" "}
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline"
            >
              Get some from Alchemy
            </a>
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <AgentForm
            onSuccess={() => {
              // Optional: redirect or show toast
            }}
          />
        </div>
      )}

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link href="/" className="text-teal-400 hover:underline">
          ← Back to home
        </Link>
      </p>
      </div>
    </div>
  );
}
