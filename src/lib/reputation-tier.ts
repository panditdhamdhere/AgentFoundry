/**
 * Reputation tier computation for agent trust badges.
 * Bronze/Silver/Gold based on feedback count and average score.
 */

export type ReputationTier = "none" | "bronze" | "silver" | "gold";

export function getReputationTier(
  count: number,
  summaryValue: number,
  summaryValueDecimals: number
): ReputationTier {
  if (count === 0) return "none";

  const avg =
    summaryValueDecimals > 0
      ? summaryValue / Math.pow(10, summaryValueDecimals)
      : summaryValue;

  // Require positive average for Silver/Gold; Bronze for any feedback
  if (avg < 0) return "bronze";

  if (count >= 15 && avg >= 70) return "gold";
  if (count >= 5 && avg >= 50) return "silver";
  if (count >= 1) return "bronze";

  return "none";
}

export function getTierLabel(tier: ReputationTier): string {
  switch (tier) {
    case "gold":
      return "Gold";
    case "silver":
      return "Silver";
    case "bronze":
      return "Bronze";
    default:
      return "";
  }
}
