"use client";

import { useState } from "react";
import Link from "next/link";

interface BetaGateProps {
  onVerified: () => void;
}

export function BetaGate({ onVerified }: BetaGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/beta-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code. Please try again.");
        setLoading(false);
        return;
      }
      onVerified();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="card-base p-10">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
        <span className="text-3xl">◈</span>
      </div>
      <h2 className="prose-heading text-center text-xl font-semibold text-zinc-100">
        Beta Access Required
      </h2>
      <p className="mt-3 text-center text-sm text-zinc-500">
        Registration is currently invite-only. Enter your invite code to continue,
        or join the waitlist for access.
      </p>
      <form onSubmit={handleSubmit} className="mt-8">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter invite code"
          required
          disabled={loading}
          className="input-base text-center"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4 w-full"
        >
          {loading ? "Verifying…" : "Continue"}
        </button>
        {error && (
          <p className="mt-3 text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/#join-beta" className="font-medium text-teal-400 hover:text-teal-300">
          Join the waitlist →
        </Link>
      </p>
    </div>
  );
}
