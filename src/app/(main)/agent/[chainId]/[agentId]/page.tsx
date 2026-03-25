"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  getAgentExplorerUrl,
  getErc8004Identifier,
  CHAIN_NAMES,
} from "@/lib/constants";
import { CopyButton } from "@/components/copy-button";
import { VerificationBadge } from "@/components/verification-badge";
import { EditAgentForm } from "@/components/edit-agent-form";
import { TransferAgentForm } from "@/components/transfer-agent-form";
import { FeedbackForm } from "@/components/feedback-form";
import { ChainBadge } from "@/components/chain-badge";
import { RevokeFeedbackButton } from "@/components/revoke-feedback-button";
import { AppendResponseForm } from "@/components/append-response-form";
import { ValidationRequestForm } from "@/components/validation-request-form";
import { AgentWalletForm } from "@/components/agent-wallet-form";
import { AgentMetadataForm } from "@/components/agent-metadata-form";
import { ReputationBadge } from "@/components/reputation-badge";
import { ValidationResponseForm } from "@/components/validation-response-form";
import { TrustScoreBadge } from "@/components/trust-score-badge";

interface AgentMetadata {
  name: string;
  description?: string;
  image?: string;
  services?: Array<{ name: string; endpoint: string; version?: string }>;
}

interface AgentData {
  chainId: number;
  agentId: string;
  owner: string | null;
  agentWallet?: string | null;
  tokenURI: string | null;
  metadata: AgentMetadata | null;
  reputation: {
    count: number;
    summaryValue: number;
    summaryValueDecimals: number;
  };
  verification?: { uriSet: boolean; schemaValid: boolean };
}

export default function AgentDetailPage() {
  const params = useParams();
  const { address } = useAccount();
  const chainId = Number(params.chainId);
  const agentId = String(params.agentId);
  const [data, setData] = useState<AgentData | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPaymentWallet, setShowPaymentWallet] = useState(false);
  const [showOnChainMetadata, setShowOnChainMetadata] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [expandedResponseFor, setExpandedResponseFor] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<
    Array<{ client: string; feedbackIndex: number; value: number; tag1: string; tag2: string; isRevoked: boolean }>
  >([]);
  const refetchFeedback = () =>
    fetch(`/api/v1/reputation?agentId=${agentId}&chainId=${chainId}&includeFeedback=true`)
      .then((r) => r.json())
      .then((d) => setFeedbackList(d.feedback ?? []));
  const [validationData, setValidationData] = useState<{
    available: boolean;
    count: number;
    averageResponse: number;
    validations: Array<{ response: number; tag: string }>;
  } | null>(null);
  const [trustScore, setTrustScore] = useState<{
    score: number;
    level: "low" | "medium" | "high";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchData = () =>
    fetch(`/api/v1/agent/${chainId}/${agentId}`)
      .then((r) => r.json())
      .then(setData);

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

  // Fetch feedback list when reputation count > 0
  useEffect(() => {
    if (!chainId || !agentId || !data || data.reputation.count === 0) return;
    fetch(`/api/v1/reputation?agentId=${agentId}&chainId=${chainId}&includeFeedback=true`)
      .then((r) => r.json())
      .then((d) => setFeedbackList(d.feedback ?? []))
      .catch(() => {});
  }, [chainId, agentId, data?.reputation.count]);

  // Fetch validation data
  useEffect(() => {
    if (!chainId || !agentId) return;
    fetch(`/api/v1/validation?agentId=${agentId}&chainId=${chainId}`)
      .then((r) => r.json())
      .then(setValidationData)
      .catch(() => setValidationData({ available: false, count: 0, averageResponse: 0, validations: [] }));
  }, [chainId, agentId]);

  // Fetch AI trust score
  useEffect(() => {
    if (!chainId || !agentId) return;
    fetch(`/api/v1/ai/trust-score?agentId=${agentId}&chainId=${chainId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.score != null && d?.level) {
          setTrustScore({ score: Number(d.score), level: d.level });
        }
      })
      .catch(() => {});
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
  const isOwner =
    !!address &&
    !!data.owner &&
    address.toLowerCase() === data.owner.toLowerCase();
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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-100">
                {data.metadata?.name ?? `Agent #${agentId}`}
              </h1>
              {data.verification && (
                <VerificationBadge
                  uriSet={data.verification.uriSet}
                  schemaValid={data.verification.schemaValid}
                  size="md"
                  showLabels
                />
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {chainName} · Agent #{agentId}
            </p>
            {trustScore && (
              <div className="mt-2">
                <TrustScoreBadge
                  score={trustScore.score}
                  level={trustScore.level}
                  size="md"
                />
              </div>
            )}

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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="font-mono text-lg font-medium text-zinc-100">
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
                <ReputationBadge
                  count={data.reputation.count}
                  summaryValue={data.reputation.summaryValue}
                  summaryValueDecimals={data.reputation.summaryValueDecimals}
                  size="md"
                />
              </div>
              {feedbackList.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-zinc-500">Recent feedback</p>
                  {feedbackList.slice(0, 8).map((fb, i) => {
                    const canRevoke =
                      !!address &&
                      !fb.isRevoked &&
                      address.toLowerCase() === fb.client.toLowerCase();
                    const responseKey = `${fb.client}-${fb.feedbackIndex}`;
                    const showResponseForm = expandedResponseFor === responseKey;
                    return (
                      <div
                        key={`${fb.client}-${fb.feedbackIndex}-${i}`}
                        className="rounded-lg bg-zinc-900/60 px-3 py-2 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="truncate font-mono text-zinc-400">
                            {fb.client.slice(0, 6)}…{fb.client.slice(-4)}
                          </span>
                          <span className="text-teal-400">
                            {fb.tag1}: {fb.value}
                            {fb.tag2 ? ` (${fb.tag2})` : ""}
                          </span>
                          <span className="flex items-center gap-2">
                            {fb.isRevoked ? (
                              <span className="text-xs text-amber-500">revoked</span>
                            ) : canRevoke ? (
                              <RevokeFeedbackButton
                                agentId={agentId}
                                chainId={chainId}
                                feedbackIndex={fb.feedbackIndex}
                                onSuccess={() => {
                                  refetchData();
                                  refetchFeedback();
                                }}
                              />
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedResponseFor(showResponseForm ? null : responseKey)
                              }
                              className="text-xs text-zinc-500 hover:text-teal-400"
                            >
                              {showResponseForm ? "−" : "Add response"}
                            </button>
                          </span>
                        </div>
                        {showResponseForm && (
                          <div className="mt-2 border-t border-zinc-800/80 pt-2">
                            <p className="mb-2 text-xs text-zinc-500">
                              Add a response (refund proof, reply, etc.). Anyone can append.
                            </p>
                            <AppendResponseForm
                              agentId={agentId}
                              chainId={chainId}
                              clientAddress={fb.client}
                              feedbackIndex={fb.feedbackIndex}
                              onSuccess={() => {
                                setExpandedResponseFor(null);
                                refetchFeedback();
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 border-t border-zinc-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className="flex w-full items-center justify-between text-left text-sm font-medium text-zinc-300"
                >
                  Give feedback
                  <span className="text-zinc-500">{showFeedbackForm ? "−" : "+"}</span>
                </button>
                {showFeedbackForm && (
                  <div className="mt-4">
                    <ChainBadge />
                    <div className="mt-3">
                      <FeedbackForm
                        agentId={agentId}
                        chainId={chainId}
                        onSuccess={() => {
                          refetchData();
                          refetchFeedback();
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Registry */}
            <div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Validation
              </h2>
              {validationData?.available ? (
                <>
                  <p className="mt-2 font-mono text-lg font-medium text-zinc-100">
                    {validationData.count} validation
                    {validationData.count !== 1 ? "s" : ""}
                    {validationData.count > 0 && (
                      <span className="ml-2 text-teal-400">
                        (avg: {validationData.averageResponse}%)
                      </span>
                    )}
                  </p>
                  {validationData.validations.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {validationData.validations.map((v, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-zinc-400"
                        >
                          <span
                            className={
                              v.response >= 100 ? "text-emerald-400" : v.response >= 50 ? "text-amber-400" : "text-red-400"
                            }
                          >
                            {v.response}%
                          </span>
                          {v.tag && <span className="text-zinc-500">· {v.tag}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {isOwner && (
                    <div className="mt-4 border-t border-zinc-800/80 pt-4">
                      <p className="text-xs font-medium text-zinc-500">
                        Request validation (owner only)
                      </p>
                      <ValidationRequestForm
                        agentId={agentId}
                        chainId={chainId}
                        onSuccess={() => {
                          fetch(`/api/v1/validation?agentId=${agentId}&chainId=${chainId}`)
                            .then((r) => r.json())
                            .then(setValidationData);
                        }}
                      />
                    </div>
                  )}
                  <div className="mt-4 border-t border-zinc-800/80 pt-4">
                    <p className="text-xs font-medium text-zinc-500">
                      Submit validation response (validator)
                    </p>
                    <ValidationResponseForm
                      agentId={agentId}
                      chainId={chainId}
                      onSuccess={() => {
                        fetch(`/api/v1/validation?agentId=${agentId}&chainId=${chainId}`)
                          .then((r) => r.json())
                          .then(setValidationData);
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  Independent validation (zkML, TEE, staked verifiers) coming soon. The ERC-8004 Validation Registry is being finalized by the 8004 team.
                </p>
              )}
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

            {/* Owner actions: Edit & Transfer */}
            {isOwner && (
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <button
                    type="button"
                    onClick={() => setShowEdit(!showEdit)}
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-zinc-300"
                  >
                    Edit metadata
                    <span className="text-zinc-500">{showEdit ? "−" : "+"}</span>
                  </button>
                  {showEdit && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80">
                      <EditAgentForm
                        chainId={chainId}
                        agentId={agentId}
                        initialName={data.metadata?.name ?? ""}
                        initialDescription={data.metadata?.description ?? ""}
                        initialImage={data.metadata?.image ?? ""}
                        initialServices={
                          data.metadata?.services?.map((s) => ({
                            name: s.name,
                            endpoint: s.endpoint,
                            version: s.version,
                          })) ?? []
                        }
                        onSuccess={() =>
                          fetch(`/api/v1/agent/${chainId}/${agentId}`)
                            .then((r) => r.json())
                            .then(setData)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentWallet(!showPaymentWallet)}
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-zinc-300"
                  >
                    Payment wallet
                    <span className="text-zinc-500">{showPaymentWallet ? "−" : "+"}</span>
                  </button>
                  {showPaymentWallet && data.owner && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80">
                      <p className="mb-3 text-xs text-zinc-500">
                        Set the address that receives payments for this agent (EIP-712 verified).
                      </p>
                      <AgentWalletForm
                        agentId={agentId}
                        chainId={chainId}
                        ownerAddress={data.owner}
                        currentAgentWallet={data.agentWallet ?? null}
                        onSuccess={() =>
                          fetch(`/api/v1/agent/${chainId}/${agentId}`)
                            .then((r) => r.json())
                            .then(setData)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <button
                    type="button"
                    onClick={() => setShowTransfer(!showTransfer)}
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-zinc-300"
                  >
                    Transfer ownership
                    <span className="text-zinc-500">{showTransfer ? "−" : "+"}</span>
                  </button>
                  {showTransfer && data.owner && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80">
                      <TransferAgentForm
                        chainId={chainId}
                        agentId={agentId}
                        ownerAddress={data.owner}
                        onSuccess={() =>
                          fetch(`/api/v1/agent/${chainId}/${agentId}`)
                            .then((r) => r.json())
                            .then(setData)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* On-chain metadata (view: anyone; set: owner only) */}
            <div className="mt-8 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <button
                type="button"
                onClick={() => setShowOnChainMetadata(!showOnChainMetadata)}
                className="flex w-full items-center justify-between text-left text-sm font-medium text-zinc-300"
              >
                On-chain metadata
                <span className="text-zinc-500">{showOnChainMetadata ? "−" : "+"}</span>
              </button>
              {showOnChainMetadata && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80">
                  <AgentMetadataForm
                    agentId={agentId}
                    chainId={chainId}
                    isOwner={!!isOwner}
                    onSuccess={() =>
                      fetch(`/api/v1/agent/${chainId}/${agentId}`)
                        .then((r) => r.json())
                        .then(setData)
                    }
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={feedbackUrl} className="btn-secondary">
                Feedback page →
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
