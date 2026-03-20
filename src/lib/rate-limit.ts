/**
 * Rate limiter: 30 req/min per IP.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set
 * (recommended for multi-instance/Vercel). Falls back to in-memory otherwise.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_SEC = 60;
const MAX_REQUESTS = 30;

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  if (realIp) return realIp;
  return "unknown";
}

// Lazy init Upstash ratelimit (only when env is set)
let upstashRatelimit: Ratelimit | null = null;
function getUpstashRatelimit(): Ratelimit | null {
  if (upstashRatelimit) return upstashRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_SEC} s`),
    prefix: "agentfoundry:ratelimit",
  });
  return upstashRatelimit;
}

// In-memory fallback for local dev / single instance
const store = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = WINDOW_SEC * 1000;

function cleanup(): void {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key);
  }
}

function checkInMemory(key: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  if (store.size > 10_000) cleanup();

  let data = store.get(key);
  if (!data) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (data.resetAt < now) {
    data = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, data);
    return { ok: true };
  }
  data.count++;
  if (data.count > MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((data.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export async function checkRateLimit(
  request: Request
): Promise<{ ok: boolean; retryAfter?: number }> {
  const key = getClientId(request);
  const ratelimit = getUpstashRatelimit();

  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(key);
    if (success) return { ok: true };
    const retryAfter = reset ? Math.max(0, Math.ceil((reset - Date.now()) / 1000)) : WINDOW_SEC;
    return { ok: false, retryAfter };
  }

  return checkInMemory(key);
}
