/** Fire-and-forget emit event to trigger webhooks. Call after registration, uri_update, or feedback. */
export function emitEvent(
  event: "registration" | "uri_update" | "feedback",
  data: Record<string, unknown>
): void {
  fetch("/api/v1/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, data }),
  }).catch(() => {});
}
