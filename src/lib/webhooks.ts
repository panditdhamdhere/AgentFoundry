const WEBHOOKS_KEY = "agentfoundry:webhooks";
const VALID_EVENTS = ["registration", "uri_update", "feedback"] as const;

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000]; // exponential: 1s, 2s, 4s

export type WebhookEvent = (typeof VALID_EVENTS)[number];

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deliverWithRetry(
  url: string,
  payload: WebhookPayload
): Promise<{ ok: boolean; attempts: number }> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) return { ok: true, attempts: attempt + 1 };
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < MAX_RETRIES) {
      await sleep(BACKOFF_MS[attempt] ?? 4000);
    }
  }
  console.warn(`Webhook delivery failed after ${MAX_RETRIES + 1} attempts:`, url, lastError);
  return { ok: false, attempts: MAX_RETRIES + 1 };
}

export async function registerWebhook(
  url: string,
  events: WebhookEvent[]
): Promise<string> {
  const redis = getRedis();
  if (!redis) throw new Error("Webhooks require Upstash Redis");

  const validEvents = events.filter((e) =>
    VALID_EVENTS.includes(e)
  ) as WebhookEvent[];
  if (validEvents.length === 0) {
    throw new Error("At least one event required: registration, uri_update, feedback");
  }

  try {
    new URL(url);
  } catch {
    throw new Error("Invalid webhook URL");
  }

  const id = crypto.randomUUID();
  const entry = JSON.stringify({
    id,
    url,
    events: validEvents,
    createdAt: new Date().toISOString(),
  });
  await redis.lpush(WEBHOOKS_KEY, entry);
  return id;
}

export async function notifyWebhooks(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const raw = await redis.lrange(WEBHOOKS_KEY, 0, -1);
    const webhooks = (raw || [])
      .map((s: string) => {
        try {
          return JSON.parse(s) as {
            url: string;
            events: WebhookEvent[];
          };
        } catch {
          return null;
        }
      })
      .filter(
        (w: { url: string; events: WebhookEvent[] } | null): w is { url: string; events: WebhookEvent[] } =>
          w !== null && w.events?.includes(event)
      );

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    await Promise.allSettled(
      webhooks.map((w) => deliverWithRetry(w.url, payload))
    );
  } catch (err) {
    console.error("Webhook notify error:", err);
  }
}
