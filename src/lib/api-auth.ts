import { requireApiKeyIfConfigured } from "./env";

/**
 * Check API auth for v1 programmatic endpoints.
 * If API_KEY env is set, validates x-api-key header. Otherwise allows all.
 * /api/upload (used by UI) is not protected - only /api/v1/* when key is configured.
 */
export function checkApiAuth(request: Request): { ok: boolean } {
  if (requireApiKeyIfConfigured(request)) return { ok: true };
  return { ok: false };
}
