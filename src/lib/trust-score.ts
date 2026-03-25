export interface TrustScoreInput {
  reputationCount: number;
  reputationAverage: number;
  validationAvailable: boolean;
  validationCount: number;
  validationAverage: number;
}

export interface TrustScoreResult {
  score: number;
  level: "low" | "medium" | "high";
  reasons: string[];
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function computeTrustScore(input: TrustScoreInput): TrustScoreResult {
  const reasons: string[] = [];

  // Base score starts neutral and shifts from reputation + validation.
  let score = 50;

  // Reputation contribution (up to +30 / -20)
  if (input.reputationCount === 0) {
    reasons.push("No reputation feedback yet.");
    score -= 10;
  } else {
    const repCountBoost = clamp(input.reputationCount, 0, 20) * 0.5; // max +10
    const repQualityDelta = clamp((input.reputationAverage - 50) * 0.4, -20, 20);
    score += repCountBoost + repQualityDelta;
    reasons.push(
      `Reputation: ${input.reputationCount} feedback, avg ${input.reputationAverage.toFixed(1)}.`
    );
  }

  // Validation contribution (up to +20 / -15)
  if (!input.validationAvailable) {
    reasons.push("Validation registry not available on this chain.");
  } else if (input.validationCount === 0) {
    reasons.push("No validation responses yet.");
  } else {
    const valCountBoost = clamp(input.validationCount, 0, 10) * 0.8; // max +8
    const valQualityDelta = clamp((input.validationAverage - 50) * 0.25, -15, 15);
    score += valCountBoost + valQualityDelta;
    reasons.push(
      `Validation: ${input.validationCount} responses, avg ${input.validationAverage.toFixed(1)}%.`
    );
  }

  score = clamp(Math.round(score), 0, 100);
  const level = score >= 75 ? "high" : score >= 45 ? "medium" : "low";

  return { score, level, reasons };
}
