import { describe, it, expect } from "vitest";
import { detectPlatform } from "@/lib/ua";

describe("detectPlatform", () => {
  it("detects iOS", () => {
    expect(detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1")).toBe("ios");
    expect(detectPlatform("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).toBe("ios");
  });
  it("detects Android", () => {
    expect(detectPlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36")).toBe("android");
  });
  it("everything else is other", () => {
    expect(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15")).toBe("other");
    expect(detectPlatform(null)).toBe("other");
  });
});
