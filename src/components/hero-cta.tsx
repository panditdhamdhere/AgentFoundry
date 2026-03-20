"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroCTA() {
  const [showCreate, setShowCreate] = useState(true);

  useEffect(() => {
    fetch("/api/beta-status")
      .then((r) => r.json())
      .then((d) => setShowCreate(d.showCreate ?? true))
      .catch(() => {});
  }, []);

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
      {showCreate ? (
        <Link href="/register" className="btn-primary">
          Create Agent
          <span className="ml-2 text-teal-200/90">→</span>
        </Link>
      ) : (
        <a href="/#join-beta" className="btn-primary">
          Join Beta Waitlist
          <span className="ml-2 text-teal-200/90">→</span>
        </a>
      )}
      <a
        href="https://www.8004scan.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary"
      >
        Explore on 8004scan
      </a>
    </div>
  );
}
