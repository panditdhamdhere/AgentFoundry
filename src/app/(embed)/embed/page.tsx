"use client";

import { useAccount } from "wagmi";
import { AgentForm } from "@/components/agent-form";
import { ChainBadge } from "@/components/chain-badge";

export default function EmbedPage() {
  const { isConnected } = useAccount();

  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/90 to-teal-600/90 text-white text-sm">
            ◈
          </span>
          <span className="text-sm font-semibold text-zinc-300">
            AgentFoundry
          </span>
        </div>
        {isConnected && <ChainBadge />}
      </div>

      {!isConnected ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">
            Connect your wallet to register an ERC-8004 agent. Supports 40+
            chains.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <AgentForm />
        </div>
      )}
    </div>
  );
}
