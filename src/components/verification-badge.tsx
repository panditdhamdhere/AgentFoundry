"use client";

interface VerificationBadgeProps {
  uriSet: boolean;
  schemaValid: boolean;
  size?: "sm" | "md";
  showLabels?: boolean;
}

export function VerificationBadge({
  uriSet,
  schemaValid,
  size = "sm",
  showLabels = false,
}: VerificationBadgeProps) {
  const fullyVerified = uriSet && schemaValid;
  const icons = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-2 py-0.5"
      title={
        fullyVerified
          ? "URI set & metadata valid"
          : uriSet
            ? "URI set"
            : schemaValid
              ? "Metadata valid"
              : "Unverified"
      }
    >
      {fullyVerified ? (
        <span
          className={`${icons} text-emerald-400`}
          title="Verified: URI set and metadata schema valid"
        >
          ✓
        </span>
      ) : uriSet || schemaValid ? (
        <span className={`${icons} text-amber-400`} title="Partially verified">
          ◐
        </span>
      ) : (
        <span className={`${icons} text-zinc-500`} title="Unverified">
          ○
        </span>
      )}
      {showLabels && (
        <span className="text-xs text-zinc-500">
          {fullyVerified
            ? "Verified"
            : uriSet
              ? "URI only"
              : schemaValid
                ? "Schema only"
                : "—"}
        </span>
      )}
    </div>
  );
}
