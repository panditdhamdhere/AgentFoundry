import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "agentfoundry_siwe";

function getSecret(): Uint8Array {
  const secret = process.env.SIWE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("SIWE_SECRET or NEXTAUTH_SECRET required");
  }
  return new TextEncoder().encode(secret);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    const { payload } = await jwtVerify(token, getSecret());
    return NextResponse.json({
      session: {
        address: payload.address,
        chainId: payload.chainId,
      },
    });
  } catch {
    return NextResponse.json({ session: null }, { status: 200 });
  }
}
