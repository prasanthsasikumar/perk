import { describe, it, expect } from "vitest";
import { signScanToken, verifyScanToken, buildScanUrl } from "@/lib/security/hmac";

describe("scan token", () => {
  it("round-trips", () => {
    const t = signScanToken("secret", "blue-bottle");
    expect(verifyScanToken("secret", "blue-bottle", t)).toBe(true);
  });
  it("rejects tampering, wrong secret, wrong slug, garbage", () => {
    const t = signScanToken("secret", "blue-bottle");
    expect(verifyScanToken("secret", "blue-bottle", t.slice(0, -1) + (t.endsWith("A") ? "B" : "A"))).toBe(false);
    expect(verifyScanToken("other", "blue-bottle", t)).toBe(false);
    expect(verifyScanToken("secret", "other", t)).toBe(false);
    expect(verifyScanToken("secret", "blue-bottle", "")).toBe(false);
    expect(verifyScanToken("secret", "blue-bottle", "not-base64!!")).toBe(false);
  });
  it("builds a verifiable URL", () => {
    const url = new URL(buildScanUrl("https://perk.app", { slug: "cafe", qrSecret: "s" }));
    expect(url.pathname).toBe("/cafe/scan");
    expect(verifyScanToken("s", "cafe", url.searchParams.get("t")!)).toBe(true);
  });
});
