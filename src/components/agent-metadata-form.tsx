"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REGISTRY_ADDRESSES, isChainSupported } from "@/lib/constants";
import { REGISTRY_ABI } from "@/lib/registry";

const RESERVED_KEYS = ["agentWallet"];

function stringToBytes(str: string): `0x${string}` {
  const enc = new TextEncoder();
  const arr = enc.encode(str);
  const hex = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}` as `0x${string}`;
}

function bytesToString(bytes: `0x${string}`): string {
  const hex = bytes.slice(2);
  if (hex.length === 0) return "";
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(arr);
}

export function AgentMetadataForm({
  agentId,
  chainId,
  isOwner,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  isOwner: boolean;
  onSuccess?: () => void;
}) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [fetchKey, setFetchKey] = useState("");
  const [fetchedValue, setFetchedValue] = useState<string | null>(null);
  const registry = REGISTRY_ADDRESSES[chainId];
  const isSupported = !!registry && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) onSuccess?.();
  }, [isSuccess, onSuccess]);

  if (!isSupported) return null;

  const handleSet = () => {
    if (!key.trim() || !registry) return;
    const k = key.trim();
    if (RESERVED_KEYS.includes(k.toLowerCase())) {
      alert(`"${k}" is reserved. Use the Payment wallet section for agentWallet.`);
      return;
    }
    writeContract({
      address: registry,
      abi: REGISTRY_ABI,
      functionName: "setMetadata",
      args: [BigInt(agentId), k, stringToBytes(value || "")],
    });
  };

  const handleFetch = async () => {
    if (!fetchKey.trim() || !registry) return;
    try {
      const { createPublicClient, http } = await import("viem");
      const { CHAIN_BY_ID } = await import("@/lib/constants");
      const { getRpcUrlForChain } = await import("@/lib/env");
      const chain = CHAIN_BY_ID[chainId];
      const rpcUrl = getRpcUrlForChain(chainId);
      const client = createPublicClient({
        chain: chain!,
        transport: rpcUrl ? http(rpcUrl) : http(),
      });
      const result = await client.readContract({
        address: registry,
        abi: REGISTRY_ABI,
        functionName: "getMetadata",
        args: [BigInt(agentId), fetchKey.trim()],
      });
      const hex = result as `0x${string}`;
      if (hex && hex.length > 2) {
        setFetchedValue(bytesToString(hex));
      } else {
        setFetchedValue("(empty)");
      }
    } catch {
      setFetchedValue("(error or not set)");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        Store custom key-value metadata on-chain. <code className="text-zinc-400">agentWallet</code> is reserved.
      </p>

      {isOwner && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-500">Set metadata</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="input-base w-32 py-2"
            />
            <input
              type="text"
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input-base min-w-0 flex-1 py-2"
            />
            <button
              type="button"
              onClick={handleSet}
              disabled={isPending || !key.trim()}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
            >
              {isPending ? "Setting…" : "Set"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-500">View metadata</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Key"
            value={fetchKey}
            onChange={(e) => {
              setFetchKey(e.target.value);
              setFetchedValue(null);
            }}
            className="input-base w-32 py-2"
          />
          <button
            type="button"
            onClick={handleFetch}
            className="btn-secondary py-2 px-4 text-sm"
          >
            Fetch
          </button>
          {fetchedValue !== null && (
            <span className="py-2 text-sm text-zinc-400">
              → {fetchedValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
