"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ActivityItem {
  chainId: number;
  agentId: string;
  owner: string;
  blockNumber: number;
  chainName: string;
  ownerShort: string;
}

export function ActivityFeed() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/activity?limit=10")
      .then((res) => (res.ok ? res.json() : { activity: [] }))
      .then((data) => setActivity(data.activity ?? []))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-300">
          Recently registered
        </h3>
        <p className="mt-3 text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-300">
          Recently registered
        </h3>
        <p className="mt-3 text-sm text-zinc-500">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">
          Recently registered
        </h3>
        <Link
          href="/directory"
          className="text-xs font-medium text-teal-400 hover:text-teal-300"
        >
          Browse all →
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {activity.map((item) => (
          <li key={`${item.chainId}-${item.agentId}-${item.blockNumber}`}>
            <Link
              href={`/agent/${item.chainId}/${item.agentId}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800/60"
            >
              <span className="font-mono text-zinc-100">
                Agent #{item.agentId}
              </span>
              <span className="text-xs text-zinc-500">
                {item.chainName} · {item.ownerShort}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
