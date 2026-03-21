"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignTypedData, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REGISTRY_ADDRESSES, isChainSupported } from "@/lib/constants";
import { REGISTRY_ABI } from "@/lib/registry";

const EIP712_DOMAIN = {
  name: "ERC8004IdentityRegistry",
  version: "1",
} as const;

export function AgentWalletForm({
  agentId,
  chainId,
  ownerAddress,
  currentAgentWallet,
  onSuccess,
}: {
  agentId: string;
  chainId: number;
  ownerAddress: string;
  currentAgentWallet: string | null;
  onSuccess?: () => void;
}) {
  const { address } = useAccount();
  const [showUnset, setShowUnset] = useState(false);
  const registry = REGISTRY_ADDRESSES[chainId];
  const isSupported = !!registry && isChainSupported(chainId);

  const deadline = Math.floor(Date.now() / 1000) + 4 * 60; // 4 min from now
  const newWallet = address ?? "0x0000000000000000000000000000000000000000";

  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) onSuccess?.();
  }, [isSuccess, onSuccess]);

  if (isSuccess) {
    return (
      <span className="text-sm text-emerald-400">Payment wallet updated.</span>
    );
  }

  if (!isSupported) return null;

  const isOwner = address?.toLowerCase() === ownerAddress.toLowerCase();
  const isCurrentWallet = currentAgentWallet?.toLowerCase() === address?.toLowerCase();

  const handleSetToCurrent = async () => {
    if (!address || !registry) return;
    const signature = await signTypedDataAsync({
      domain: {
        ...EIP712_DOMAIN,
        chainId,
        verifyingContract: registry,
      },
      types: {
        AgentWalletSet: [
          { name: "agentId", type: "uint256" },
          { name: "newWallet", type: "address" },
          { name: "owner", type: "address" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "AgentWalletSet",
      message: {
        agentId: BigInt(agentId),
        newWallet: address as `0x${string}`,
        owner: ownerAddress as `0x${string}`,
        deadline: BigInt(deadline),
      },
    });
    writeContract({
      address: registry,
      abi: REGISTRY_ABI,
      functionName: "setAgentWallet",
      args: [BigInt(agentId), address as `0x${string}`, BigInt(deadline), signature as `0x${string}`],
    });
  };

  const handleUnset = () => {
    if (!registry) return;
    writeContract({
      address: registry,
      abi: REGISTRY_ABI,
      functionName: "unsetAgentWallet",
      args: [BigInt(agentId)],
    });
  };

  if (!isOwner) return null;

  const isPending = isSigning || isWriting;

  return (
    <div className="space-y-3">
      {currentAgentWallet && (
        <p className="text-xs text-zinc-500">
          Payment wallet:{" "}
          <span className="font-mono text-zinc-400">
            {currentAgentWallet.slice(0, 6)}…{currentAgentWallet.slice(-4)}
          </span>
        </p>
      )}
      {!showUnset ? (
        <>
          <button
            type="button"
            onClick={handleSetToCurrent}
            disabled={isPending || isCurrentWallet || !address}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
          >
            {isPending ? "Signing…" : isCurrentWallet ? "Already set" : "Set to my wallet"}
          </button>
          {currentAgentWallet && (
            <button
              type="button"
              onClick={() => setShowUnset(true)}
              className="ml-2 text-xs text-zinc-500 hover:text-amber-400"
            >
              Unset
            </button>
          )}
        </>
      ) : (
        <div>
          <p className="mb-2 text-xs text-zinc-500">Clear payment wallet?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUnset}
              disabled={isPending}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
            >
              {isPending ? "Unsetting…" : "Confirm unset"}
            </button>
            <button
              type="button"
              onClick={() => setShowUnset(false)}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
