import { describe, it, expect } from "vitest";
import { isValidSlug, slugify } from "@/lib/slug";

describe("slug", () => {
  it("validates", () => {
    expect(isValidSlug("blue-bottle")).toBe(true);
    expect(isValidSlug("cafe123")).toBe(true);
    expect(isValidSlug("Dashboard")).toBe(false);
    expect(isValidSlug("dashboard")).toBe(false);
    expect(isValidSlug("ab")).toBe(false);
    expect(isValidSlug("-abc")).toBe(false);
    expect(isValidSlug("a".repeat(41))).toBe(false);
  });
  it("slugifies", () => {
    expect(slugify("Blue Bottle Café!")).toBe("blue-bottle-cafe");
    expect(slugify("  The   Daily Grind ")).toBe("the-daily-grind");
  });
});
