import { describe, it, expect } from "vitest";
import { shadeHex, brandGradient } from "@/lib/color";

describe("shadeHex", () => {
  it("darkens and lightens", () => {
    expect(shadeHex("#46306f", -0.5)).toBe("#231838");
    expect(shadeHex("#000000", 1)).toBe("#ffffff");
    expect(shadeHex("#ffffff", -1)).toBe("#000000");
  });
  it("passes through malformed input", () => {
    expect(shadeHex("purple", -0.2)).toBe("purple");
  });
  it("builds a gradient", () => {
    expect(brandGradient("#46306f")).toBe("linear-gradient(180deg, #46306f 0%, #39275b 100%)");
  });
});
