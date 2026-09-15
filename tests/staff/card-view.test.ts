import { describe, it, expect } from "vitest";
import { toCardView } from "@/lib/staff/card-view";
import type { Card } from "@/lib/db/schema";

describe("toCardView", () => {
  const shop = { stampsRequired: 10, rewardText: "Free gelato", rewardTiers: [{ stamps: 5, reward: "Free coffee" }] };
  it("serialises dates, derives tiers and merges flags", () => {
    const card = { id: "c", shortCode: "ABCD2345", stamps: 2, pendingRewards: ["Free coffee"], lastStampedAt: new Date("2026-01-01T00:00:00Z") } as Card;
    expect(toCardView(shop, card, { duplicate: true })).toEqual({
      id: "c",
      shortCode: "ABCD2345",
      stamps: 2,
      stampsRequired: 10,
      tiers: [{ stamps: 5, reward: "Free coffee" }, { stamps: 10, reward: "Free gelato" }],
      milestones: [5],
      pendingRewards: ["Free coffee"],
      rewardsAvailable: 1,
      lastStampedAt: "2026-01-01T00:00:00.000Z",
      duplicate: true,
    });
    expect(toCardView(shop, { ...card, lastStampedAt: null }).lastStampedAt).toBeNull();
  });
});
