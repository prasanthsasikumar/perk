import { describe, it, expect } from "vitest";
import { generateShortCode, normalizeShortCode, looksLikeShortCode, SHORT_CODE_ALPHABET } from "@/lib/security/short-code";
import { randomPin, randomToken } from "@/lib/security/random";

describe("short codes", () => {
  it("has length 8 from the safe alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const c = generateShortCode();
      expect(c).toHaveLength(8);
      for (const ch of c) expect(SHORT_CODE_ALPHABET).toContain(ch);
    }
  });
  it("does not collide in 1000 draws", () => {
    const set = new Set(Array.from({ length: 1000 }, generateShortCode));
    expect(set.size).toBe(1000);
  });
  it("normalizes", () => {
    expect(normalizeShortCode(" ab-cd 2345 ")).toBe("ABCD2345");
    expect(looksLikeShortCode("abcd-2345")).toBe(true);
    expect(looksLikeShortCode("abcd-0000")).toBe(false);
    expect(looksLikeShortCode("short")).toBe(false);
  });
});

describe("random", () => {
  it("pin is 6 digits", () => { expect(randomPin()).toMatch(/^\d{6}$/); });
  it("token is url-safe", () => { expect(randomToken(16)).toMatch(/^[A-Za-z0-9_-]+$/); });
});
