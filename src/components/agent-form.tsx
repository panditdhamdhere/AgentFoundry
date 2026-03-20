"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { decodeEventLog } from "viem";
import { REGISTRY_ABI } from "@/lib/registry";
import {
  REGISTRY_ADDRESSES,
  BLOCK_EXPLORERS,
  getBlockExplorerUrl,
  isChainSupported,
} from "@/lib/constants";
import { buildAgentCard } from "@/lib/agent-card";
import { AGENT_TEMPLATES } from "@/lib/templates";
import type { AgentService } from "@/lib/types";

const DEFAULT_IMAGE =
  "ipfs://bafkreiaims435hmzeg3l6ixlrlvnei7wept5kmfd6c2ncz3ucl466xhucu";

interface PendingRegistration {
  name: string;
  description: string;
  imageUri: string;
  services: AgentService[];
}

export function AgentForm({
  onSuccess,
}: {
  onSuccess?: (agentId: bigint) => void;
}) {
  const { address, chain } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [services, setServices] = useState<AgentService[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [step, setStep] = useState<
    "form" | "uploading" | "registering" | "setting-uri" | "done" | "error"
  >("form");
  const [error, setError] = useState<string | null>(null);
  const [registeredAgentId, setRegisteredAgentId] = useState<bigint | null>(null);
  const pendingRef = useRef<PendingRegistration | null>(null);

  const chainId = chain?.id ?? 84532;
  const registryAddress = REGISTRY_ADDRESSES[chainId as keyof typeof REGISTRY_ADDRESSES];
  const agentRegistry = registryAddress
    ? `eip155:${chainId}:${registryAddress}`
    : "";
  const isSupported = !!registryAddress && isChainSupported(chainId);
  const blockExplorerInfo = registryAddress
    ? BLOCK_EXPLORERS[chainId as keyof typeof BLOCK_EXPLORERS]
    : null;
  const explorerUrl = registryAddress
    ? getBlockExplorerUrl(chainId, registryAddress)
    : null;
  const explorerName = blockExplorerInfo?.name ?? "Explorer";

  const {
    writeContract: registerContract,
    data: registerHash,
    isPending: isRegisterPending,
  } = useWriteContract();

  const {
    writeContract: setUriContract,
    data: setUriHash,
    isPending: isSetUriPending,
  } = useWriteContract();

  const { data: registerReceipt, isLoading: isRegisterConfirming } =
    useWaitForTransactionReceipt({
      hash: registerHash,
    });

  const { isSuccess: isSetUriSuccess } = useWaitForTransactionReceipt({
    hash: setUriHash,
  });

  const applyTemplate = (templateId: string) => {
    const t = AGENT_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setName(t.name);
    setDescription(t.formDescription);
    setServices(t.services.length ? t.services.map((s) => ({ ...s })) : []);
  };

  const addService = () => {
    setServices([...services, { name: "", endpoint: "" }]);
  };

  const updateService = (
    i: number,
    field: keyof AgentService,
    value: string
  ) => {
    const next = [...services];
    next[i] = { ...next[i], [field]: value };
    setServices(next);
  };

  const removeService = (i: number) => {
    setServices(services.filter((_, idx) => idx !== i));
  };

  // When register tx confirms, upload agent card and set URI
  useEffect(() => {
    const pending = pendingRef.current;
    if (
      !registerReceipt ||
      !registerHash ||
      !pending ||
      !registryAddress
    ) {
      return;
    }

    const run = async () => {
      try {
        let agentId: bigint | null = null;
        for (const log of registerReceipt.logs) {
          if (log.address.toLowerCase() !== registryAddress.toLowerCase()) continue;
          try {
            const decoded = decodeEventLog({
              abi: REGISTRY_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "Registered") {
              agentId = (decoded.args as { agentId: bigint }).agentId;
              break;
            }
          } catch {
            continue;
          }
        }
        if (agentId === null) {
          throw new Error("Could not find Registered event in transaction");
        }
        setRegisteredAgentId(agentId);

        setStep("setting-uri");

        const { name: n, description: d, imageUri: img, services: svc } = pending;

        const agentCard = buildAgentCard({
          chainId,
          agentId,
          name: n,
          description: d,
          image: img,
          services: svc,
        });

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agentCard),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to upload agent card");
        }

        const { ipfsUri } = await res.json();

        setUriContract({
          address: registryAddress,
          abi: REGISTRY_ABI,
          functionName: "setAgentURI",
          args: [agentId, ipfsUri],
        });

        pendingRef.current = null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep("error");
        pendingRef.current = null;
      }
    };

    run();
  }, [
    registerReceipt,
    registerHash,
    registryAddress,
    agentRegistry,
    setUriContract,
  ]);

  // When setAgentURI tx confirms
  useEffect(() => {
    if (isSetUriSuccess && step === "setting-uri") {
      setStep("done");
      if (registeredAgentId) {
        onSuccess?.(registeredAgentId);
      }
    }
  }, [isSetUriSuccess, step, registeredAgentId, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError("Please connect your wallet");
      return;
    }
    if (!registryAddress || !isSupported) {
      setError(
        `Chain not supported. Please switch to an ERC-8004 supported network.`
      );
      return;
    }

    if (!name.trim() || !description.trim()) {
      setError("Name and description are required");
      return;
    }

    let imageUri = image.trim() || DEFAULT_IMAGE;

    try {
      setStep("uploading");

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to upload image");
        }
        const data = await res.json();
        imageUri = data.ipfsUri;
      }

      pendingRef.current = {
        name: name.trim(),
        description: description.trim(),
        imageUri,
        services,
      };

      setStep("registering");

      registerContract({
        address: registryAddress,
        abi: REGISTRY_ABI,
        functionName: "register",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  };

  const isProcessing =
    step === "uploading" ||
    step === "registering" ||
    step === "setting-uri" ||
    isRegisterPending ||
    isRegisterConfirming ||
    isSetUriPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Template (optional)
        </label>
        <select
          onChange={(e) => applyTemplate(e.target.value)}
          className="input-base"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a template...
          </option>
          {AGENT_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} — {t.description}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {step === "done" && registeredAgentId && registryAddress && explorerUrl && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          Success! Agent #{registeredAgentId.toString()} registered on{" "}
          {chain?.name || "network"}.{" "}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on {explorerName}
          </a>
          {" · "}
          <Link
            href={`/feedback?agentId=${registeredAgentId}&chainId=${chainId}`}
            className="underline hover:text-emerald-300"
          >
            Give feedback
          </Link>
        </div>
      )}

      {address && !isSupported && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-400">
          Switch to an ERC-8004 supported network (Base, Ethereum, Polygon,
          Arbitrum, etc.).
        </div>
      )}

      {step === "uploading" && (
        <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-sm text-teal-300">
          Uploading to IPFS...
        </div>
      )}

      {(step === "registering" || isRegisterPending || isRegisterConfirming) && (
        <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-sm text-teal-300">
          Confirm the transaction in your wallet to register on-chain...
        </div>
      )}

      {(step === "setting-uri" || isSetUriPending) && (
        <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-sm text-teal-300">
          Setting agent URI... Confirm the second transaction.
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Agent Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My AI Agent"
          className="input-base"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does your agent do?"
          rows={3}
          className="input-base resize-none"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Image
        </label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setImageFile(f ?? null);
              if (!f) setImage("");
            }}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-teal-500"
          />
          <span className="text-xs text-zinc-500">Or paste an image URL:</span>
          <input
            type="url"
            value={image}
            onChange={(e) => {
              setImage(e.target.value);
              setImageFile(null);
            }}
            placeholder="https://... or ipfs://..."
            className="input-base"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            Services (MCP, A2A, web, etc.)
          </label>
          <button
            type="button"
            onClick={addService}
            className="text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {services.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. MCP)"
                value={s.name}
                onChange={(e) => updateService(i, "name", e.target.value)}
                className="input-base flex-1 text-sm"
              />
              <input
                type="url"
                placeholder="Endpoint URL"
                value={s.endpoint}
                onChange={(e) => updateService(i, "endpoint", e.target.value)}
                className="input-base flex-[2] text-sm"
              />
              <button
                type="button"
                onClick={() => removeService(i)}
                className="rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-red-500/10"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!address || !isSupported || isProcessing}
        className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-teal-600"
      >
        {step === "done" ? "Registered!" : "Register Agent"}
      </button>
    </form>
  );
}
