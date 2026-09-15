import type { PublicShop } from "@/lib/db/queries/shops";
import { countRewards, rewardTiers } from "@/lib/domain/tiers";

/** "5 stamps · Free coffee / 10 stamps · Free gelato" for customer-facing cards. Server-safe. */
export function RewardTiersList({ shop, className = "" }: { shop: Pick<PublicShop, "stampsRequired" | "rewardText" | "rewardTiers">; className?: string }) {
  const tiers = rewardTiers(shop);
  if (tiers.length === 1) return <p className={`text-sm text-ink-soft ${className}`}>Reward: {tiers[0].reward}</p>;
  return (
    <ul className={`space-y-1 text-sm text-ink-soft ${className}`}>
      {tiers.map((t) => (
        <li key={t.stamps} className="flex items-baseline gap-2">
          <span className="w-16 shrink-0 tabular-nums text-ink-muted">{t.stamps} stamps</span>
          <span>{t.reward}</span>
        </li>
      ))}
    </ul>
  );
}

/** "Free coffee ×2 · Gelato" pill content for banked rewards. */
export function pendingRewardsLabel(pending: string[]): string {
  return countRewards(pending).map((r) => (r.count > 1 ? `${r.reward} ×${r.count}` : r.reward)).join(" · ");
}
