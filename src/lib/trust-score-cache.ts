import { Redis } from "@upstash/redis";
import type { TrustScoreResult } from "./trust-score";

const CACHE_PREFIX = "agentfoundry:trustscore:";
const TTL_SECONDS = 300; // 5 minutes

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function cacheKey(chainId: number, agentId: string): string {
  return `${CACHE_PREFIX}${chainId}:${agentId}`;
}

export async function getCachedTrustScore(
  chainId: number,
  agentId: string
): Promise<TrustScoreResult | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string>(cacheKey(chainId, agentId));
    if (!raw) return null;
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!obj || typeof obj !== "object") return null;
    if (
      typeof (obj as { score?: unknown }).score === "number" &&
      typeof (obj as { level?: unknown }).level === "string" &&
      Array.isArray((obj as { reasons?: unknown }).reasons)
    ) {
      return obj as TrustScoreResult;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCachedTrustScore(
  chainId: number,
  agentId: string,
  score: TrustScoreResult
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.setex(
      cacheKey(chainId, agentId),
      TTL_SECONDS,
      JSON.stringify(score)
    );
  } catch (err) {
    console.warn("Trust score cache set failed:", err);
  }
}
