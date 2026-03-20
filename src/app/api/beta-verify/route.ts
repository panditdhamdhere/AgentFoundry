import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const COOKIE_NAME = "agentfoundry_beta";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  const rate = await checkRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  if (process.env.BETA_PUBLIC_REGISTRATION === "true") {
    return NextResponse.json({ verified: true }); // Public, allow
  }

  const code = process.env.BETA_ACCESS_CODE;
  if (!code) {
    return NextResponse.json({ error: "Registration is invite-only. No codes configured." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const provided = typeof body.code === "string" ? body.code.trim() : "";
    if (!provided) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }
    if (provided !== code) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
    }

    const response = NextResponse.json({ verified: true });
    response.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
