import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows first request", async () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    const result = await checkRateLimit(req);
    expect(result.ok).toBe(true);
  });

  it("returns retryAfter when limit exceeded", async () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "10.20.30.40" },
    });
    for (let i = 0; i < 31; i++) {
      const result = await checkRateLimit(req);
      if (!result.ok) {
        expect(typeof result.retryAfter).toBe("number");
        return;
      }
    }
    expect.fail("Expected rate limit to trigger");
  });
});
