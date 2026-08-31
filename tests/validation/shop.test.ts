import { describe, it, expect } from "vitest";
import { onboardingSchema, shopSettingsSchema, fieldErrors } from "@/lib/validation/shop";

const good = { name: "Blue Bottle", brandColor: "#c96a2b", stampsRequired: "10", rewardText: "Free coffee", stampMode: "barista", customerScanCooldownMin: "15" };

describe("shop validation", () => {
  it("accepts valid settings and coerces numbers", () => {
    const r = shopSettingsSchema.parse(good);
    expect(r.stampsRequired).toBe(10);
  });
  it("rejects out-of-range and bad colour", () => {
    const r = shopSettingsSchema.safeParse({ ...good, stampsRequired: "2", brandColor: "red" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fe = fieldErrors(r.error);
      expect(fe.stampsRequired).toMatch(/at least 3/i);
      expect(fe.brandColor).toBeTruthy();
    }
  });
  it("validates slug", () => {
    expect(onboardingSchema.safeParse({ ...good, slug: "Dashboard" }).success).toBe(false);
    const ok = onboardingSchema.safeParse({ ...good, slug: "Blue-Bottle" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.slug).toBe("blue-bottle");
  });
});
