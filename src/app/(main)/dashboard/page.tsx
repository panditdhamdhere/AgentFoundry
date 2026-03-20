"use client";

import { useAccount } from "wagmi";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();

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

            <div className="card-base border-dashed border-zinc-700/60 bg-zinc-900/20 p-12 text-center">
              <p className="text-zinc-500">
                Agents you register will appear here. The ERC-8004 registry stores
                agents on-chain—you can view all agents on{" "}
                <a
                  href="https://www.8004scan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-400 transition-colors hover:text-teal-300"
                >
                  8004scan
                </a>
                .
              </p>
              <Link href="/register" className="btn-primary mt-6">
                Create your first agent
              </Link>
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
