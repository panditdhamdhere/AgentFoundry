"use client";

import { useAccount } from "wagmi";
import { SUPPORTED_CHAINS, isChainSupported } from "@/lib/constants";

export function ChainBadge() {
  const { chain } = useAccount();

  if (!chain) return null;

  const supported = isChainSupported(chain.id);
  const chainInfo = SUPPORTED_CHAINS.find((c) => c.id === chain.id);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        supported
          ? "border border-teal-500/30 bg-teal-500/10 text-teal-400"
          : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${supported ? "bg-teal-400" : "bg-amber-400"}`}
      />
      {chainInfo?.name || chain.name}
      {!supported && (
        <span className="opacity-80">(switch to supported)</span>
      )}
    </div>
  );
}
