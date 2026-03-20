"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  REPUTATION_REGISTRY_ADDRESSES,
  REGISTRY_ADDRESSES,
  isChainSupported,
} from "@/lib/constants";
import { emitEvent } from "@/lib/emit-event";
import { REPUTATION_ABI } from "@/lib/reputation-registry";

const TAG1_OPTIONS = [
  { value: "starred", label: "Quality (0–100)" },
  { value: "reachable", label: "Endpoint reachable" },
  { value: "successRate", label: "Success rate (%)" },
  { value: "responseTime", label: "Response time (ms)" },
  { value: "uptime", label: "Uptime (%)" },
];

export function FeedbackForm({
  agentId,
  chainId,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  onSuccess?: () => void;
}) {
  const { address } = useAccount();
  const [value, setValue] = useState("");
  const [tag1, setTag1] = useState("starred");
  const [tag2, setTag2] = useState("");
  const [endpoint, setEndpoint] = useState("");

  const reputationAddress = REPUTATION_REGISTRY_ADDRESSES[chainId];
  const identityAddress = REGISTRY_ADDRESSES[chainId];
  const isSupported =
    !!reputationAddress &&
    !!identityAddress &&
    isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    onSuccess?.();
    emitEvent("feedback", { chainId, agentId, client: address });
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-400">
        Feedback submitted successfully!
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !reputationAddress || !value.trim()) return;

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const decimals = tag1 === "uptime" || tag1 === "successRate" ? 2 : 0;

    writeContract({
      address: reputationAddress,
      abi: REPUTATION_ABI,
      functionName: "giveFeedback",
      args: [
        BigInt(agentId),
        BigInt(numValue),
        decimals,
        tag1,
        tag2,
        endpoint || "",
        "",
        "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
      ],
    });
  };

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-400">
        Chain not supported. Switch to an ERC-8004 network.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Feedback type
        </label>
        <select
          value={tag1}
          onChange={(e) => setTag1(e.target.value)}
          className="input-base"
        >
          {TAG1_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Value *
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={tag1 === "starred" ? "0-100" : tag1 === "reachable" ? "0 or 1" : "e.g. 95"}
          className="input-base"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Tag 2 (optional)
        </label>
        <input
          type="text"
          value={tag2}
          onChange={(e) => setTag2(e.target.value)}
          placeholder="e.g. day, week, month"
          className="input-base"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Endpoint (optional)
        </label>
        <input
          type="url"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://..."
          className="input-base"
        />
      </div>

      <button
        type="submit"
        disabled={!address || !value.trim() || isPending}
        className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
