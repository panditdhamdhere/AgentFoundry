import { NextResponse } from "next/server";
import { uploadAgentCard, uploadImage } from "@/lib/ipfs";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AgentCard } from "@/lib/types";

export async function POST(request: Request) {
  const rate = await checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: rate.retryAfter
          ? { "Retry-After": String(rate.retryAfter) }
          : undefined,
      }
    );
  }
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const agentCard = (await request.json()) as AgentCard;
      const { cid, ipfsUri } = await uploadAgentCard(agentCard);
      return NextResponse.json({ cid, ipfsUri });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      const { cid, ipfsUri } = await uploadImage(file);
      return NextResponse.json({ cid, ipfsUri });
    }

    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload",
      },
      { status: 500 }
    );
  }
}
