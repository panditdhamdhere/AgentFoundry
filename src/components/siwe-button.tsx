"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export function SiweButton() {
  const { address, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);

    try {
      const nonceRes = await fetch("/api/auth/siwe/nonce");
      const { nonce } = await nonceRes.json();

      const domain =
        typeof window !== "undefined" ? window.location.hostname : "localhost";
      const uri =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      const message = new SiweMessage({
        domain,
        address,
        statement: "Sign in to AgentFoundry with your Ethereum account.",
        uri,
        version: "1",
        chainId: chain?.id ?? 84532,
        nonce,
      });

      const messageToSign = message.prepareMessage();
      const signature = await signMessageAsync({ message: messageToSign });

      const verifyRes = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSign, signature }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Verification failed");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="text-xs font-medium text-teal-400 hover:text-teal-300 disabled:opacity-50"
      >
        {loading ? "Signing…" : "Sign in with Ethereum"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
