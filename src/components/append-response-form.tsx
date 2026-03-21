"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  REPUTATION_REGISTRY_ADDRESSES,
  isChainSupported,
} from "@/lib/constants";
import { REPUTATION_ABI } from "@/lib/reputation-registry";
import { emitEvent } from "@/lib/emit-event";

const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

export function AppendResponseForm({
  agentId,
  chainId,
  clientAddress,
  feedbackIndex,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  clientAddress: string;
  feedbackIndex: number;
  onSuccess?: () => void;
}) {
  const [responseUri, setResponseUri] = useState("");
  const reputationAddress = REPUTATION_REGISTRY_ADDRESSES[chainId];
  const isSupported = !!reputationAddress && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    onSuccess?.();
    emitEvent("feedback", { chainId, agentId, action: "response_appended" });
    return (
      <span className="text-sm text-emerald-400">Response appended successfully.</span>
    );
  }

  if (!isSupported) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseUri.trim()) return;
    writeContract({
      address: reputationAddress!,
      abi: REPUTATION_ABI,
      functionName: "appendResponse",
      args: [
        BigInt(agentId),
        clientAddress as `0x${string}`,
        BigInt(feedbackIndex),
        responseUri.trim(),
        ZERO_HASH, // IPFS/URL – hash not required
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        type="url"
        value={responseUri}
        onChange={(e) => setResponseUri(e.target.value)}
        placeholder="https://... or ipfs://..."
        className="input-base flex-1 py-2 text-sm"
        required
      />
      <button
        type="submit"
        disabled={!responseUri.trim() || isPending}
        className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Add response"}
      </button>
    </form>
  );
}
