import type { Card, RewardTier, Shop } from "@/lib/db/schema";
import { bonusStampPositions, rewardTiers } from "@/lib/domain/tiers";

export type CardView = {
  id: string;
  shortCode: string;
  stamps: number;
  stampsRequired: number;
  /** Every reward on the card, lowest threshold first (the last one resets the card). */
  tiers: RewardTier[];
  /** 1-based stamp positions that bank a bonus reward. */
  milestones: number[];
  /** Banked, unredeemed reward labels. */
  pendingRewards: string[];
  rewardsAvailable: number;
  lastStampedAt: string | null;
  duplicate?: boolean;
  rewardEarned?: boolean;
  rewardsEarned?: string[];
  redeemed?: string;
};

export type CardViewExtra = Pick<CardView, "duplicate" | "rewardEarned" | "rewardsEarned" | "redeemed">;

export function toCardView(shop: Pick<Shop, "stampsRequired" | "rewardText" | "rewardTiers">, card: Card, extra: CardViewExtra = {}): CardView {
  return {
    id: card.id,
    shortCode: card.shortCode,
    stamps: card.stamps,
    stampsRequired: shop.stampsRequired,
    tiers: rewardTiers(shop),
    milestones: bonusStampPositions(shop),
    pendingRewards: card.pendingRewards,
    rewardsAvailable: card.pendingRewards.length,
    lastStampedAt: card.lastStampedAt ? card.lastStampedAt.toISOString() : null,
    ...extra,
  };
}
