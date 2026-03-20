"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error" | "already";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, useCase: useCase || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many attempts. Please try again in a minute.");
        } else if (res.status === 503) {
          setError("Waitlist is temporarily unavailable. Please try again later.");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      if (data.message?.includes("already")) {
        setStatus("already");
      } else {
        setStatus("success");
        setEmail("");
        setUseCase("");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-6 py-8 text-center">
        <p className="text-lg font-semibold text-teal-400">You&apos;re on the list!</p>
        <p className="mt-2 text-sm text-zinc-400">
          We&apos;ll notify you when the beta launches.
        </p>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-6 py-8 text-center">
        <p className="text-lg font-semibold text-teal-400">You&apos;re already on the list</p>
        <p className="mt-2 text-sm text-zinc-400">We&apos;ll be in touch when we launch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === "loading"}
          className="input-base min-w-0 flex-1"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary shrink-0 px-8"
        >
          {status === "loading" ? "Joining…" : "Join Beta"}
        </button>
      </div>
      <input
        type="text"
        value={useCase}
        onChange={(e) => setUseCase(e.target.value)}
        placeholder="What will you build? (optional)"
        disabled={status === "loading"}
        className="input-base"
        aria-label="Use case (optional)"
      />
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
