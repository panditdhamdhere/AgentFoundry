"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function BetaNav() {
  const [showCreate, setShowCreate] = useState(true);

  useEffect(() => {
    fetch("/api/beta-status")
      .then((r) => r.json())
      .then((d) => setShowCreate(d.showCreate ?? true))
      .catch(() => {});
  }, []);

  if (!showCreate) return null;

  return (
    <Link
      href="/register"
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
    >
      Create
    </Link>
  );
}
