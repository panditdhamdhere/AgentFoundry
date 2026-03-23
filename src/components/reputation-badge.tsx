"use client";

import { getReputationTier, getTierLabel, type ReputationTier } from "@/lib/reputation-tier";

const TIER_STYLES: Record<
  Exclude<ReputationTier, "none">,
  { bg: string; text: string; label: string }
> = {
  bronze: {
    bg: "bg-amber-900/40",
    text: "text-amber-400",
    label: "Bronze",
  },
  silver: {
    bg: "bg-zinc-400/20",
    text: "text-zinc-300",
    label: "Silver",
  },
  gold: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "Gold",
  },
};

export function ReputationBadge({
  count,
  summaryValue,
  summaryValueDecimals,
  size = "sm",
}: {
  count: number;
  summaryValue: number;
  summaryValueDecimals: number;
  size?: "sm" | "md";
}) {
  const tier = getReputationTier(count, summaryValue, summaryValueDecimals);
  if (tier === "none") return null;

  const style = TIER_STYLES[tier];
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${style.bg} ${style.text} ${sizeClass}`}
      title={`${getTierLabel(tier)} tier · ${count} feedback`}
    >
      {style.label}
    </span>
  );
}
