"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  VALIDATION_REGISTRY_ADDRESSES,
  isChainSupported,
} from "@/lib/constants";
import { VALIDATION_ABI } from "@/lib/validation-registry";

const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

export function ValidationRequestForm({
  agentId,
  chainId,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  onSuccess?: () => void;
}) {
  const [validatorAddress, setValidatorAddress] = useState("");
  const [requestUri, setRequestUri] = useState("");
  const validationAddress = VALIDATION_REGISTRY_ADDRESSES[chainId];
  const isSupported =
    !!validationAddress && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    onSuccess?.();
    return (
      <span className="text-sm text-emerald-400">Validation request submitted.</span>
    );
  }

  if (!isSupported) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatorAddress.trim() || !requestUri.trim()) return;
    const addr = validatorAddress.trim() as `0x${string}`;
    if (!addr.startsWith("0x") || addr.length !== 42) return;
    writeContract({
      address: validationAddress!,
      abi: VALIDATION_ABI,
      functionName: "validationRequest",
      args: [addr, BigInt(agentId), requestUri.trim(), ZERO_HASH],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Validator address
        </label>
        <input
          type="text"
          value={validatorAddress}
          onChange={(e) => setValidatorAddress(e.target.value)}
          placeholder="0x..."
          className="input-base py-2 text-sm font-mono"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Request URI (IPFS or HTTPS)
        </label>
        <input
          type="url"
          value={requestUri}
          onChange={(e) => setRequestUri(e.target.value)}
          placeholder="ipfs://... or https://..."
          className="input-base py-2 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={!validatorAddress.trim() || !requestUri.trim() || isPending}
        className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Request validation"}
      </button>
    </form>
  );
}
