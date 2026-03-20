import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { verifyMessage } from "viem";
import { SignJWT } from "jose";

const SESSION_COOKIE = "agentfoundry_siwe";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array {
  const secret = process.env.SIWE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("SIWE_SECRET or NEXTAUTH_SECRET required for SIWE");
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message : "";
    const signature = typeof body.signature === "string" ? body.signature : "";

    if (!message || !signature) {
      return NextResponse.json(
        { error: "message and signature required" },
        { status: 400 }
      );
    }

    const siweMessage = new SiweMessage(message);

    const url = new URL(request.url);
    const domain = url.hostname;
    if (siweMessage.domain !== domain) {
      return NextResponse.json(
        { error: "Domain mismatch" },
        { status: 400 }
      );
    }

    const isValid = await verifyMessage({
      message,
      signature: signature as `0x${string}`,
      address: siweMessage.address as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      address: siweMessage.address,
      chainId: siweMessage.chainId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${MAX_AGE}s`)
      .sign(getSecret());

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("SIWE verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
