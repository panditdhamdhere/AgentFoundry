"use client";

import { useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  REPUTATION_REGISTRY_ADDRESSES,
  isChainSupported,
} from "@/lib/constants";
import { REPUTATION_ABI } from "@/lib/reputation-registry";
import { emitEvent } from "@/lib/emit-event";

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
  const { address } = useAccount();
  const reputationAddress = REPUTATION_REGISTRY_ADDRESSES[chainId];
  const isSupported = !!reputationAddress && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  const emitted = useRef(false);

  useEffect(() => {
    if (isSuccess && !emitted.current) {
      emitted.current = true;
      emitEvent("feedback_revoked", {
        chainId,
        agentId,
        feedbackIndex,
        client: address ?? undefined,
      });
      onSuccess?.();
    }
  }, [isSuccess, address, chainId, agentId, feedbackIndex, onSuccess]);

  if (isSuccess) {
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
