"use client";

import { useAccount } from "wagmi";
import { AgentForm } from "@/components/agent-form";
import { ChainBadge } from "@/components/chain-badge";

export default function EmbedPage() {
  const { isConnected } = useAccount();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/90 to-teal-600/90 text-white text-sm shadow-lg shadow-teal-500/20">
            ◈
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-200">
            AgentFoundry
          </span>
        </div>
        {isConnected && <ChainBadge />}
      </div>

      {!isConnected ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8 text-center backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-zinc-400">
            Connect your wallet to register an ERC-8004 agent. Supports 40+
            chains.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <AgentForm />
        </div>
      )}
    </div>
  );
}
