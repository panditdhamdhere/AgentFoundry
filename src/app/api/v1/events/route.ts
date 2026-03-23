import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { notifyWebhooks } from "@/lib/webhooks";
import type { WebhookEvent } from "@/lib/webhooks";

const VALID_EVENTS: WebhookEvent[] = [
  "registration",
  "uri_update",
  "feedback",
  "feedback_revoked",
  "ownership_transfer",
  "validation_response",
];

export async function POST(request: Request) {
  const rate = await checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const event = body.event as string | undefined;
    const data = body.data && typeof body.data === "object" ? body.data : {};

    if (!event || !VALID_EVENTS.includes(event as WebhookEvent)) {
      return NextResponse.json(
        {
          error:
            "Invalid event. Use: registration, uri_update, feedback, feedback_revoked, ownership_transfer, validation_response",
        },
        { status: 400 }
      );
    }

    await notifyWebhooks(event as WebhookEvent, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process event" },
      { status: 500 }
    );
  }
}
