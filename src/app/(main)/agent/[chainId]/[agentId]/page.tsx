"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAgentExplorerUrl,
  getErc8004Identifier,
  CHAIN_NAMES,
} from "@/lib/constants";
import { CopyButton } from "@/components/copy-button";

interface AgentMetadata {
  name: string;
  description?: string;
  image?: string;
  services?: Array<{ name: string; endpoint: string; version?: string }>;
}

interface AgentData {
  chainId: number;
  agentId: string;
  tokenURI: string | null;
  metadata: AgentMetadata | null;
  reputation: {
    count: number;
    summaryValue: number;
    summaryValueDecimals: number;
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const chainId = Number(params.chainId);
  const agentId = String(params.agentId);
  const [data, setData] = useState<AgentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chainId || !agentId) return;
    fetch(`/api/v1/agent/${chainId}/${agentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load agent");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [chainId, agentId]);

  if (loading) {
    return (
      <div className="section-padding w-full">
        <div className="mx-auto max-w-2xl">
          <p className="text-zinc-500">Loading agent…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="section-padding w-full">
        <div className="mx-auto max-w-2xl">
          <p className="text-red-400">{error ?? "Agent not found"}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-teal-400 hover:text-teal-300"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const chainName = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
  const scanUrl = getAgentExplorerUrl(chainId, agentId);
  const feedbackUrl = `/feedback?agentId=${agentId}&chainId=${chainId}`;
  const identifier = getErc8004Identifier(chainId, agentId);
  const shareableUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/agent/${chainId}/${agentId}`
      : "";

  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-500 hover:text-teal-400"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="card-base overflow-hidden p-0">
          {/* Header with image */}
          {data.metadata?.image && (
            <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  data.metadata.image.startsWith("ipfs://")
                    ? `https://gateway.pinata.cloud/ipfs/${data.metadata.image.replace("ipfs://", "").split("/")[0]}`
                    : data.metadata.image
                }
                alt={data.metadata.name ?? "Agent"}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <h1 className="text-xl font-semibold text-zinc-100">
              {data.metadata?.name ?? `Agent #${agentId}`}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {chainName} · Agent #{agentId}
            </p>

            {/* Copy identifier & shareable link */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  ERC-8004 Identifier
                </p>
                <CopyButton
                  text={identifier}
                  label="Copy identifier"
                  className="mt-1 block font-mono text-xs text-zinc-400 hover:text-teal-400"
                />
              </div>
              {shareableUrl && (
                <div>
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Shareable link
                  </p>
                  <CopyButton
                    text={shareableUrl}
                    label="Copy link"
                    className="mt-1 block font-mono text-xs text-zinc-400 hover:text-teal-400"
                  />
                </div>
              )}
            </div>

            {data.metadata?.description && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {data.metadata.description}
              </p>
            )}

            {/* Reputation */}
            <div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Reputation
              </h2>
              <p className="mt-2 font-mono text-lg font-medium text-zinc-100">
                {data.reputation.count} feedback
                {data.reputation.count !== 1 ? "s" : ""}
                {data.reputation.count > 0 && data.reputation.summaryValue !== 0 && (
                  <span className="ml-2 text-teal-400">
                    (avg: {data.reputation.summaryValue}
                    {data.reputation.summaryValueDecimals > 0
                      ? `.${String(data.reputation.summaryValueDecimals).padStart(2, "0")}`
                      : ""}
                    )
                  </span>
                )}
              </p>
            </div>

            {/* Services */}
            {data.metadata?.services && data.metadata.services.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Services
                </h2>
                <ul className="mt-2 space-y-2">
                  {data.metadata.services.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-zinc-900/60 px-3 py-2"
                    >
                      <span className="font-medium text-zinc-300">
                        {s.name}
                      </span>
                      <a
                        href={s.endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm text-teal-400 hover:underline"
                      >
                        {s.endpoint}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={feedbackUrl} className="btn-primary">
                Give feedback
              </Link>
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on block explorer →
              </a>
              <a
                href="https://www.8004scan.io/agents"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-700/80 bg-zinc-800/40 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60 hover:text-zinc-100"
              >
                8004scan →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
