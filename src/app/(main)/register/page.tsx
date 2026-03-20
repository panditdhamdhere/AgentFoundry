"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { AgentForm } from "@/components/agent-form";
import { ChainBadge } from "@/components/chain-badge";

export default function RegisterPage() {
  const { isConnected } = useAccount();

  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-xl">
        <div className="page-header">
          {isConnected && (
            <div className="mb-5">
              <ChainBadge />
            </div>
          )}
          <h1 className="page-title">Create Agent</h1>
          <p className="page-description">
            Give your AI agent an on-chain identity with ERC-8004. Connect your
            wallet and fill in the details below.
          </p>
        </div>

        {!isConnected ? (
          <div className="card-base p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
              <span className="text-3xl">◈</span>
            </div>
            <p className="text-zinc-400">
              Connect your wallet to register an agent. Supports 40+ chains:
              Base, Ethereum, Polygon, Arbitrum, Optimism, and more.
            </p>
            <p className="mt-6 text-sm text-zinc-500">
              Need testnet ETH?{" "}
              <a
                href="https://www.alchemy.com/faucets/base-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal-400 transition-colors hover:text-teal-300"
              >
                Get some from Alchemy
              </a>
            </p>
          </div>
        ) : (
          <div className="card-base p-8">
            <AgentForm onSuccess={() => {}} />
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
