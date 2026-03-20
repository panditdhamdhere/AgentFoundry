"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import { REGISTRY_ABI } from "@/lib/registry";
import { REGISTRY_ADDRESSES, isChainSupported } from "@/lib/constants";

interface TransferAgentFormProps {
  chainId: number;
  agentId: string;
  ownerAddress: string;
  onSuccess?: () => void;
}

export function TransferAgentForm({
  chainId,
  agentId,
  ownerAddress,
  onSuccess,
}: TransferAgentFormProps) {
  const [toAddress, setToAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registryAddress = REGISTRY_ADDRESSES[chainId];
  const isSupported = !!registryAddress && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && !success) {
      setSuccess(true);
      onSuccess?.();
    }
  }, [isSuccess, success, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registryAddress || !isSupported) {
      setError("Chain not supported");
      return;
    }

    const trimmed = toAddress.trim();
    if (!isAddress(trimmed)) {
      setError("Invalid Ethereum address");
      return;
    }
    if (trimmed.toLowerCase() === ownerAddress.toLowerCase()) {
      setError("Cannot transfer to yourself");
      return;
    }

    writeContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "transferFrom",
      args: [ownerAddress as `0x${string}`, trimmed as `0x${string}`, BigInt(agentId)],
    });
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400">
        Transfer completed successfully!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-400">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          Recipient address
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="0x..."
          className="input-base font-mono text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-secondary w-full py-2 text-sm disabled:opacity-50"
      >
        {isPending ? "Confirm in wallet…" : "Transfer ownership"}
      </button>
    </form>
  );
}
