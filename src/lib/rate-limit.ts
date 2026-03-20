/**
 * Simple in-memory rate limiter (per IP).
 * For multi-instance deployment, use Redis (e.g. @upstash/ratelimit).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30; // per window for write APIs (upload, agent-card)

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  if (realIp) return realIp;
  return "unknown";
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key);
  }
}

export function checkRateLimit(request: Request): { ok: boolean; retryAfter?: number } {
  const key = getClientId(request);
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
