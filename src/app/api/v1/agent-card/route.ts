import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadAgentCard } from "@/lib/ipfs";
import { buildAgentCard } from "@/lib/agent-card";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkApiAuth } from "@/lib/api-auth";

const AgentServiceSchema = z.object({
  name: z.string().min(1),
  endpoint: z.string().url(),
  version: z.string().optional(),
});

const BodySchema = z.object({
  chainId: z.number().int().positive(),
  agentId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/, "agentId must be numeric")]),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  image: z
    .string()
    .min(1, "Image URL or IPFS URI is required")
    .refine(
      (s) => s.startsWith("https://") || s.startsWith("ipfs://") || s.startsWith("http://"),
      "Image must be an https://, ipfs://, or http:// URL"
    ),
  services: z.array(AgentServiceSchema).default([]),
  supportedTrust: z.array(z.string()).optional(),
  x402Support: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = checkApiAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Missing or invalid x-api-key header" },
      { status: 401 }
    );
  }
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
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { chainId, agentId, name, description, image, services, supportedTrust, x402Support, active } =
      parsed.data;

    const agentIdNum = typeof agentId === "string" ? parseInt(agentId, 10) : agentId;

    const agentCard = buildAgentCard({
      chainId,
      agentId: agentIdNum,
      name,
      description,
      image,
      services,
      supportedTrust,
      x402Support,
      active,
    });

    const { cid, ipfsUri } = await uploadAgentCard(agentCard);

    return NextResponse.json({
      ipfsUri,
      cid,
      agentCard,
    });
  } catch (error) {
    console.error("Agent card API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create agent card",
      },
      { status: 500 }
    );
  }
}
