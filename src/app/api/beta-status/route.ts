import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "agentfoundry_beta";

export async function GET() {
  const isGated = process.env.BETA_PUBLIC_REGISTRATION !== "true";
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(COOKIE_NAME)?.value === "1";

  return NextResponse.json({
    isGated,
    hasAccess,
    showCreate: !isGated || hasAccess,
  });
}
