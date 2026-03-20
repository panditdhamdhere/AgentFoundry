import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireApiKeyIfConfigured } from "@/lib/env";
import { registerWebhook } from "@/lib/webhooks";
import type { WebhookEvent } from "@/lib/webhooks";

export async function POST(request: Request) {
  const rate = await checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  if (!requireApiKeyIfConfigured(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const validEvents: WebhookEvent[] = ["registration", "uri_update", "feedback"];
    const events = Array.isArray(body.events)
      ? body.events.filter((e: unknown): e is WebhookEvent =>
          typeof e === "string" && validEvents.includes(e as WebhookEvent)
        )
      : [];

    if (!url) {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      );
    }

    const id = await registerWebhook(url, events);
    return NextResponse.json({ id, url, events });
  } catch (error) {
    console.error("Webhook registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register webhook" },
      { status: 500 }
    );
  }
}
