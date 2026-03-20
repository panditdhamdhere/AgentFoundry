const WEBHOOKS_KEY = "agentfoundry:webhooks";
const VALID_EVENTS = ["registration", "uri_update", "feedback"] as const;

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
      webhooks.map((w) =>
        fetch(w.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        })
      )
    );
  } catch (err) {
    console.error("Webhook notify error:", err);
  }
}
