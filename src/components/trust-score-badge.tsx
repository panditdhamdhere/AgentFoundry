"use client";

export function TrustScoreBadge({
  score,
  level,
  size = "sm",
}: {
  score: number;
  level: "low" | "medium" | "high";
  size?: "sm" | "md";
}) {
  const color =
    level === "high"
      ? "bg-emerald-500/15 text-emerald-400"
      : level === "medium"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-red-500/15 text-red-400";
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass}`}
      title={`AI Trust Score: ${score}/100`}
    >
      AI Trust {score}
    </span>
  );
}
