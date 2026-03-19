"use client";

import { useAccount } from "wagmi";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();

  return (
    <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-zinc-500">
          View and manage your registered agents.
        </p>
      </div>

      {!isConnected ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">
            Connect your wallet to view your agents.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-medium text-zinc-500">Your Wallet</h2>
            <p className="mt-1 font-mono text-sm text-zinc-300">
              {address}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
            <p className="text-zinc-500">
              Agents you register will appear here. The ERC-8004 registry stores
              agents on-chain—you can view all agents on{" "}
              <a
                href="https://www.8004scan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:underline"
              >
                8004scan
              </a>
              .
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
            >
              Create your first agent
            </Link>
          </div>
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
