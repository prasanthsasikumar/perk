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

describe("bonus reward tiers", () => {
  it("parses, sorts and validates tiers against stamps required", () => {
    const ok = shopSettingsSchema.safeParse({ ...good, rewardTiers: JSON.stringify([{ stamps: "8", reward: "Free cake" }, { stamps: 5, reward: "Free coffee" }]) });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.rewardTiers).toEqual([{ stamps: 5, reward: "Free coffee" }, { stamps: 8, reward: "Free cake" }]);
    expect(shopSettingsSchema.parse(good).rewardTiers).toEqual([]);
    expect(shopSettingsSchema.parse({ ...good, rewardTiers: "" }).rewardTiers).toEqual([]);
    const tooHigh = shopSettingsSchema.safeParse({ ...good, rewardTiers: JSON.stringify([{ stamps: 10, reward: "Free coffee" }]) });
    expect(tooHigh.success).toBe(false);
    if (!tooHigh.success) expect(fieldErrors(tooHigh.error).rewardTiers).toMatch(/fewer than 10/);
    const dup = shopSettingsSchema.safeParse({ ...good, rewardTiers: JSON.stringify([{ stamps: 5, reward: "A coffee" }, { stamps: 5, reward: "A tea" }]) });
    expect(dup.success).toBe(false);
    const bad = shopSettingsSchema.safeParse({ ...good, rewardTiers: "not json" });
    expect(bad.success).toBe(false);
    expect(shopSettingsSchema.parse({ ...good, stampStyle: "star" }).stampStyle).toBe("star");
    expect(shopSettingsSchema.safeParse({ ...good, stampStyle: "triangle" }).success).toBe(false);
  });
});
