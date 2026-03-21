"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  REPUTATION_REGISTRY_ADDRESSES,
  isChainSupported,
} from "@/lib/constants";
import { REPUTATION_ABI } from "@/lib/reputation-registry";

export function RevokeFeedbackButton({
  agentId,
  chainId,
  feedbackIndex,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  feedbackIndex: number;
  onSuccess?: () => void;
}) {
  const reputationAddress = REPUTATION_REGISTRY_ADDRESSES[chainId];
  const isSupported = !!reputationAddress && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    onSuccess?.();
    return <span className="text-xs text-amber-500">Revoked</span>;
  }

  if (!isSupported) return null;

  const handleRevoke = () => {
    writeContract({
      address: reputationAddress!,
      abi: REPUTATION_ABI,
      functionName: "revokeFeedback",
      args: [BigInt(agentId), BigInt(feedbackIndex)],
    });
  };

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={isPending}
      className="text-xs text-amber-500 hover:text-amber-400 disabled:opacity-50"
    >
      {isPending ? "Revoking…" : "Revoke"}
    </button>
  );
}
