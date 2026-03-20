import { cookies } from "next/headers";
import { RegisterContent } from "./register-content";

const COOKIE_NAME = "agentfoundry_beta";

export default async function RegisterPage() {
  // Gate by default in beta; set BETA_PUBLIC_REGISTRATION=true to open
  const isGated = process.env.BETA_PUBLIC_REGISTRATION !== "true";
  const hasCode = !!process.env.BETA_ACCESS_CODE?.trim();
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(COOKIE_NAME)?.value === "1";

  return (
    <RegisterContent
      isGated={isGated}
      hasAccess={hasAccess}
      hasCode={hasCode}
    />
  );
}
