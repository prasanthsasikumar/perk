import type { Card, RewardTier, Shop } from "@/lib/db/schema";

export type TierShop = Pick<Shop, "stampsRequired" | "rewardText" | "rewardTiers">;

/** Every reward on the card, lowest threshold first. The final tier is always stamps_required / reward_text. */
export function rewardTiers(shop: TierShop): RewardTier[] {
  const bonus = (shop.rewardTiers ?? []).filter((t) => t.stamps > 0 && t.stamps < shop.stampsRequired);
  return [...bonus.sort((a, b) => a.stamps - b.stamps), { stamps: shop.stampsRequired, reward: shop.rewardText }];
}

/** 1-based stamp positions that bank a bonus reward (excludes the final stamp). */
export function bonusStampPositions(shop: TierShop): number[] {
  return rewardTiers(shop).slice(0, -1).map((t) => t.stamps);
}

/** "5 stamps: Free coffee · 10 stamps: Gelato" (single tier: "10 stamps: Free coffee"). */
export function describeTiers(shop: TierShop): string {
  return rewardTiers(shop).map((t) => `${t.stamps} stamps: ${t.reward}`).join(" · ");
}

export type RewardCount = { reward: string; count: number };

/** Group banked rewards by label, preserving first-earned order. */
export function countRewards(pending: string[]): RewardCount[] {
  const out: RewardCount[] = [];
  for (const reward of pending) {
    const hit = out.find((r) => r.reward === reward);
    if (hit) hit.count += 1;
    else out.push({ reward, count: 1 });
  }
  return out;
}

/** "Free coffee ×2 · Gelato ×1"; empty string when nothing is banked. */
export function summarizeRewards(pending: string[]): string {
  return countRewards(pending).map((r) => (r.count > 1 ? `${r.reward} ×${r.count}` : r.reward)).join(" · ");
}

export function rewardsAvailable(card: Pick<Card, "pendingRewards">): number {
  return card.pendingRewards.length;
}

export type StampState = { stamps: number; pendingRewards: string[] };
export type StampStep = StampState & { earned: string | null };

/**
 * Apply one stamp. Reaching a bonus tier banks its reward; reaching the final tier banks
 * the final reward and resets the card. Pure, so adjustments can replay it stamp by stamp.
 */
export function applyStamp(state: StampState, shop: TierShop): StampStep {
  const tiers = rewardTiers(shop);
  const stamps = state.stamps + 1;
  const hit = tiers.find((t) => t.stamps === stamps);
  if (!hit) return { stamps, pendingRewards: state.pendingRewards, earned: null };
  const isFinal = stamps >= shop.stampsRequired;
  return { stamps: isFinal ? 0 : stamps, pendingRewards: [...state.pendingRewards, hit.reward], earned: hit.reward };
}

/** One line under the stamp grid: what happens next for this card. */
export function statusLine(stamps: number, pending: string[], tiers: RewardTier[]): string {
  if (pending.length > 0 && stamps === 0) return `Reward ready: ${pending[pending.length - 1]}. Claim it at the counter.`;
  if (stamps === 0) return "Your card starts empty. First stamp with your next coffee.";
  const next = tiers.find((t) => t.stamps > stamps) ?? tiers[tiers.length - 1];
  const left = next.stamps - stamps;
  return `${left} ${left === 1 ? "stamp" : "stamps"} to go. Next up: ${next.reward}.`;
}

