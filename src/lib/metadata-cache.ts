/**
 * Redis cache for IPFS/HTTP agent metadata.
 * Reduces RPC and IPFS gateway calls when same URIs are requested repeatedly.
 * Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Falls back to no cache.
 */

import { Redis } from "@upstash/redis";
import type { AgentCard } from "./types";

const CACHE_PREFIX = "agentfoundry:metadata:";
const TTL_SECONDS = 3600; // 1 hour

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function cacheKey(uri: string): string {
  return `${CACHE_PREFIX}${uri}`;
}

export async function getCachedMetadata(
  uri: string
): Promise<AgentCard | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string>(cacheKey(uri));
    if (!raw) return null;
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!obj || typeof obj !== "object") return null;
    if (obj?.name && obj?.type && Array.isArray(obj?.services)) {
      return obj as AgentCard;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCachedMetadata(
  uri: string,
  metadata: AgentCard
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.setex(
      cacheKey(uri),
      TTL_SECONDS,
      JSON.stringify(metadata)
    );
  } catch (err) {
    console.warn("Metadata cache set failed:", err);
  }
}
