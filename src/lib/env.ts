/**
 * Environment variable validation.
 * Server-only vars (e.g. PINATA) are validated when used, not at module load,
 * to avoid client bundle errors. Client vars (NEXT_PUBLIC_*) are validated at load.
 */

const isProd = process.env.NODE_ENV === "production";

function getClientEnv(key: string): string {
  const value = process.env[key] ?? "";
  return value.trim() && value !== "YOUR_PROJECT_ID" ? value : "";
}

export const env = {
  pinata: {
    jwt: process.env.PINATA_JWT ?? "",
    gateway: process.env.PINATA_GATEWAY ?? "",
  },
  walletConnect: {
    get projectId() {
      const id = getClientEnv("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
      return id || "00000000000000000000000000000000"; // Placeholder so app loads
    },
  },
  rpc: {
    mainnet: process.env.NODE_RPC_URL_MAINNET,
    baseSepolia: process.env.NODE_RPC_URL_BASE_SEPOLIA,
  },
  apiKey: process.env.API_KEY ?? "",
};

/** If API_KEY is set, requests must include x-api-key header. */
export function requireApiKeyIfConfigured(request: Request): boolean {
  const configured = env.apiKey && env.apiKey.length > 0;
  if (!configured) return true;
  const provided = request.headers.get("x-api-key");
  return provided === env.apiKey;
}

/** Call before Pinata operations. Throws in production if vars missing. */
export function ensurePinataConfig(): { jwt: string; gateway: string } {
  const { jwt, gateway } = env.pinata;
  if (!jwt || !gateway) {
    throw new Error(
      isProd
        ? "Missing PINATA_JWT or PINATA_GATEWAY. Set them in your deployment env."
        : "Missing PINATA_JWT or PINATA_GATEWAY. Add them to .env.local"
    );
  }
  return { jwt, gateway };
}
