import type { Card, Shop } from "@/lib/db/schema";

export type CardView = {
  id: string;
  shortCode: string;
  stamps: number;
  stampsRequired: number;
  rewardsAvailable: number;
  lastStampedAt: string | null;
  duplicate?: boolean;
  rewardEarned?: boolean;
};

export function toCardView(shop: Pick<Shop, "stampsRequired">, card: Card, extra: { duplicate?: boolean; rewardEarned?: boolean } = {}): CardView {
  return {
    id: card.id,
    shortCode: card.shortCode,
    stamps: card.stamps,
    stampsRequired: shop.stampsRequired,
    rewardsAvailable: card.rewardsAvailable,
    lastStampedAt: card.lastStampedAt ? card.lastStampedAt.toISOString() : null,
    ...extra,
  };
}
