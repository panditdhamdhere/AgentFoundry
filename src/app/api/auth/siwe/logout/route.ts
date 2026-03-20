import { NextResponse } from "next/server";

const SESSION_COOKIE = "agentfoundry_siwe";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return res;
}
