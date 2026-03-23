import type { WebhookEvent } from "./webhooks";

/** Fire-and-forget emit event to trigger webhooks. */
export function emitEvent(
  event: WebhookEvent,
  data: Record<string, unknown>
): void {
  fetch("/api/v1/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, data }),
  }).catch(() => {});
}
