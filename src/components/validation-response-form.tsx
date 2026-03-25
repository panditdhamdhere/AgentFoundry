"use client";

import { useEffect, useRef, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  VALIDATION_REGISTRY_ADDRESSES,
  isChainSupported,
} from "@/lib/constants";
import { VALIDATION_ABI } from "@/lib/validation-registry";
import { emitEvent } from "@/lib/emit-event";

const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export function ValidationResponseForm({
  agentId,
  chainId,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  onSuccess?: () => void;
}) {
  const [requestHash, setRequestHash] = useState("");
  const [response, setResponse] = useState("100");
  const [responseUri, setResponseUri] = useState("");
  const [tag, setTag] = useState("");

  const validationAddress = VALIDATION_REGISTRY_ADDRESSES[chainId];
  const isSupported = !!validationAddress && isChainSupported(chainId);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  const emitted = useRef(false);

  useEffect(() => {
    if (!isSuccess || emitted.current) return;
    emitted.current = true;
    emitEvent("validation_response", {
      chainId,
      agentId,
      requestHash,
      response: Number(response),
      responseURI: responseUri || "",
      tag: tag || "",
    });
    onSuccess?.();
  }, [isSuccess, chainId, agentId, requestHash, response, responseUri, tag, onSuccess]);

  if (!isSupported) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hashTrimmed = requestHash.trim();
    const numericResponse = Number(response);
    if (!/^0x[a-fA-F0-9]{64}$/.test(hashTrimmed)) return;
    if (Number.isNaN(numericResponse) || numericResponse < 0 || numericResponse > 100) return;
    emitted.current = false;
    writeContract({
      address: validationAddress,
      abi: VALIDATION_ABI,
      functionName: "validationResponse",
      args: [
        hashTrimmed as `0x${string}`,
        numericResponse,
        responseUri.trim(),
        ZERO_HASH,
        tag.trim(),
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Request hash
        </label>
        <input
          type="text"
          value={requestHash}
          onChange={(e) => setRequestHash(e.target.value)}
          placeholder="0x..."
          className="input-base py-2 text-sm font-mono"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Response (0-100)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="input-base py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Response URI (optional)
        </label>
        <input
          type="url"
          value={responseUri}
          onChange={(e) => setResponseUri(e.target.value)}
          placeholder="ipfs://... or https://..."
          className="input-base py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          Tag (optional)
        </label>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="soft-finality / hard-finality / custom"
          className="input-base py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!requestHash.trim() || !response.trim() || isPending}
        className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit validation response"}
      </button>
      {isSuccess && (
        <p className="text-sm text-emerald-400">Validation response submitted.</p>
      )}
    </form>
  );
}
