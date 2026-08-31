import { describe, it, expect } from "vitest";
import { toCardView } from "@/lib/staff/card-view";
import type { Card } from "@/lib/db/schema";

describe("toCardView", () => {
  it("serialises dates and merges flags", () => {
    const card = { id: "c", shortCode: "ABCD2345", stamps: 2, rewardsAvailable: 0, lastStampedAt: new Date("2026-01-01T00:00:00Z") } as Card;
    expect(toCardView({ stampsRequired: 10 }, card, { duplicate: true })).toEqual({ id: "c", shortCode: "ABCD2345", stamps: 2, stampsRequired: 10, rewardsAvailable: 0, lastStampedAt: "2026-01-01T00:00:00.000Z", duplicate: true });
    expect(toCardView({ stampsRequired: 10 }, { ...card, lastStampedAt: null }).lastStampedAt).toBeNull();
  });
});
