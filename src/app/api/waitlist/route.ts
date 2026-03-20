import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { checkRateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(request: Request) {
  const rate = await checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined,
      }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const useCase = typeof body.useCase === "string" ? body.useCase.trim().slice(0, 500) : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: "Waitlist is not configured. Please try again later." },
        { status: 503 }
      );
    }

    const key = `agentfoundry:waitlist:${email}`;
    const exists = await redis.get(key);
    if (exists) {
      return NextResponse.json(
        { message: "You're already on the list. We'll be in touch!" },
        { status: 200 }
      );
    }

    const data = {
      email,
      useCase: useCase || undefined,
      createdAt: new Date().toISOString(),
    };
    await redis.set(key, JSON.stringify(data));
    await redis.sadd("agentfoundry:waitlist:emails", email);

    return NextResponse.json({
      message: "You're on the list! We'll notify you when the beta launches.",
    });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
