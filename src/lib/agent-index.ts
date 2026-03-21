/**
 * Redis-backed index of agent registrations for fast directory queries.
 * Populated by cron job; directory API reads from here when available.
 */

import { Redis } from "@upstash/redis";
import type { AgentCard } from "./types";

const INDEX_PREFIX = "agentfoundry:index:agents:";
const MAX_AGENTS_PER_CHAIN = 500;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export interface IndexedAgent {
  agentId: string;
  owner: string;
  blockNumber: number;
  tokenURI: string | null;
  metadata: AgentCard | null;
  verification: { uriSet: boolean; schemaValid: boolean };
  chainName: string;
}

function indexKey(chainId: number): string {
  return `${INDEX_PREFIX}${chainId}`;
}

/** Read indexed agents for a chain. Returns empty array if not indexed or Redis unavailable. */
export async function getIndexedAgents(
  chainId: number
): Promise<IndexedAgent[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.get<string>(indexKey(chainId));
    if (!raw) return [];
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

/** Write indexed agents for a chain. Overwrites existing. */
export async function setIndexedAgents(
  chainId: number,
  agents: IndexedAgent[]
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const trimmed = agents.slice(0, MAX_AGENTS_PER_CHAIN);
    await redis.set(indexKey(chainId), JSON.stringify(trimmed));
  } catch (err) {
    console.warn("Agent index write failed:", err);
  }
}
