"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REGISTRY_ABI } from "@/lib/registry";
import { REGISTRY_ADDRESSES, isChainSupported } from "@/lib/constants";
import { buildAgentCard } from "@/lib/agent-card";
import type { AgentService } from "@/lib/types";

const DEFAULT_IMAGE =
  "ipfs://bafkreiaims435hmzeg3l6ixlrlvnei7wept5kmfd6c2ncz3ucl466xhucu";

interface EditAgentFormProps {
  chainId: number;
  agentId: string;
  initialName: string;
  initialDescription: string;
  initialImage: string;
  initialServices: AgentService[];
  onSuccess?: () => void;
}

export function EditAgentForm({
  chainId,
  agentId,
  initialName,
  initialDescription,
  initialImage,
  initialServices,
  onSuccess,
}: EditAgentFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [image, setImage] = useState(initialImage ?? "");
  const [services, setServices] = useState<AgentService[]>(
    initialServices?.length ? initialServices : []
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "uploading" | "setting-uri" | "done" | "error">("form");
  const [error, setError] = useState<string | null>(null);

  const registryAddress = REGISTRY_ADDRESSES[chainId];
  const isSupported = !!registryAddress && isChainSupported(chainId);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && step === "setting-uri") {
      setStep("done");
      onSuccess?.();
    }
  }, [isSuccess, step, onSuccess]);

  const addService = () => {
    setServices([...services, { name: "", endpoint: "" }]);
  };

  const updateService = (i: number, field: keyof AgentService, value: string) => {
    const next = [...services];
    next[i] = { ...next[i], [field]: value };
    setServices(next);
  };

  const removeService = (i: number) => {
    setServices(services.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registryAddress || !isSupported) {
      setError("Chain not supported");
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
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to upload image");
        }
        const data = await res.json();
        imageUri = data.ipfsUri;
      }

      const agentCard = buildAgentCard({
        chainId,
        agentId: Number(agentId),
        name: name.trim(),
        description: description.trim(),
        image: imageUri,
        services,
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
      setStep("setting-uri");

      writeContract({
        address: registryAddress,
        abi: REGISTRY_ABI,
        functionName: "setAgentURI",
        args: [BigInt(agentId), ipfsUri],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  };

  const isProcessing =
    step === "uploading" || step === "setting-uri" || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {step === "done" && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          Metadata updated successfully!
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-base"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="input-base resize-none"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Image</label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setImageFile(f ?? null);
              if (!f) setImage("");
            }}
            className="block w-full text-sm text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
          />
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
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">Services</label>
          <button
            type="button"
            onClick={addService}
            className="text-xs font-medium text-teal-400 hover:text-teal-300"
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
                placeholder="Endpoint"
                value={s.endpoint}
                onChange={(e) => updateService(i, "endpoint", e.target.value)}
                className="input-base flex-[2] text-sm"
              />
              <button
                type="button"
                onClick={() => removeService(i)}
                className="rounded px-2 py-1 text-red-400 hover:bg-red-500/10"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
      >
        {step === "uploading" && "Uploading…"}
        {(step === "setting-uri" || isPending) && "Confirm in wallet…"}
        {step === "done" && "Updated!"}
        {(step === "form" || step === "error") && "Save changes"}
      </button>
    </form>
  );
}
