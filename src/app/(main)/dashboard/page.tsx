"use client";

import { useAccount } from "wagmi";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();

  return (
    <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-500">
            View and manage your registered agents.
          </p>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center shadow-xl shadow-black/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
              <span className="text-2xl">◈</span>
            </div>
            <p className="text-zinc-400">
              Connect your wallet to view your agents.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Your Wallet
              </h2>
              <p className="mt-2 font-mono text-sm text-zinc-300">
                {address}
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 text-center shadow-xl shadow-black/20">
              <p className="text-zinc-500">
                Agents you register will appear here. The ERC-8004 registry stores
                agents on-chain—you can view all agents on{" "}
                <a
                  href="https://www.8004scan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-400 transition-colors hover:text-teal-300"
                >
                  8004scan
                </a>
                .
              </p>
              <Link
                href="/register"
                className="btn-primary mt-6"
              >
                Create your first agent
              </Link>
            </div>
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
