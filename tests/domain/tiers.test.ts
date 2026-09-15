import { describe, it, expect } from "vitest";
import { applyStamp, bonusStampPositions, countRewards, describeTiers, rewardTiers, summarizeRewards } from "@/lib/domain/tiers";

const single = { stampsRequired: 10, rewardText: "Free coffee", rewardTiers: [] };
const tiered = { stampsRequired: 10, rewardText: "Free gelato", rewardTiers: [{ stamps: 5, reward: "Free coffee" }] };

describe("rewardTiers", () => {
  it("always ends with the final reward and sorts bonus tiers", () => {
    expect(rewardTiers(single)).toEqual([{ stamps: 10, reward: "Free coffee" }]);
    const messy = { stampsRequired: 12, rewardText: "Gelato", rewardTiers: [{ stamps: 8, reward: "Cake" }, { stamps: 4, reward: "Coffee" }, { stamps: 12, reward: "ignored" }, { stamps: 0, reward: "ignored" }] };
    expect(rewardTiers(messy).map((t) => t.stamps)).toEqual([4, 8, 12]);
    expect(bonusStampPositions(messy)).toEqual([4, 8]);
  });
  it("describes tiers for posters and passes", () => {
    expect(describeTiers(single)).toBe("10 stamps: Free coffee");
    expect(describeTiers(tiered)).toBe("5 stamps: Free coffee · 10 stamps: Free gelato");
  });
});

describe("applyStamp", () => {
  it("banks and resets at the final tier", () => {
    const s = { stamps: 8, pendingRewards: [] as string[] };
    let step = applyStamp(s, single);
    expect(step).toEqual({ stamps: 9, pendingRewards: [], earned: null });
    step = applyStamp(step, single);
    expect(step).toEqual({ stamps: 0, pendingRewards: ["Free coffee"], earned: "Free coffee" });
  });
  it("banks a bonus reward without resetting", () => {
    let step = applyStamp({ stamps: 4, pendingRewards: [] }, tiered);
    expect(step).toEqual({ stamps: 5, pendingRewards: ["Free coffee"], earned: "Free coffee" });
    for (let i = 0; i < 4; i++) step = applyStamp(step, tiered);
    expect(step.earned).toBeNull();
    step = applyStamp(step, tiered);
    expect(step).toEqual({ stamps: 0, pendingRewards: ["Free coffee", "Free gelato"], earned: "Free gelato" });
  });
});

describe("reward summaries", () => {
  it("groups by label in earned order", () => {
    expect(countRewards(["Free coffee", "Gelato", "Free coffee"])).toEqual([{ reward: "Free coffee", count: 2 }, { reward: "Gelato", count: 1 }]);
    expect(summarizeRewards(["Free coffee", "Gelato", "Free coffee"])).toBe("Free coffee ×2 · Gelato");
    expect(summarizeRewards([])).toBe("");
  });
});
