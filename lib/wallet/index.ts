import { waitUntil } from "@vercel/functions";
import type { Card, Shop } from "@/lib/db/schema";
import { appleWallet } from "./apple";
import { pushToShopCards } from "./apns";
import { googleWallet, updateGoogleObjects } from "./google";

/** Fan out an update to every wallet that may hold this card. Logs failures; never throws. */
export async function notifyWallets(shop: Shop, card: Card): Promise<void> {
  const jobs: Array<{ provider: string; run: () => Promise<void> }> = [
    { provider: "apple", run: () => appleWallet.updatePass(shop, card) },
  ];
  if (card.googleObjectId) jobs.push({ provider: "google", run: () => googleWallet.updatePass(shop, card) });
  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error("[wallet] update failed", { provider: jobs[i].provider, shopId: shop.id, cardId: card.id }, r.reason);
  });
}

/** Schedule the fan-out after the response is sent (Vercel) or fire-and-forget locally. */
export function scheduleWalletUpdate(shop: Shop, card: Card): void {
  const p = notifyWallets(shop, card).catch((e) => console.error("[wallet] scheduleWalletUpdate", e));
  try {
    waitUntil(p);
  } catch {
    /* outside a request context (tests/scripts): let it run detached */
  }
}

/** Shop settings the pass itself renders. Changing any of them makes every issued pass stale. */
const PASS_FIELDS = ["name", "logoUrl", "brandColor", "stampsRequired", "rewardText", "rewardTiers", "stampStyle"] as const;

/** True when a settings save changed something a customer would see on their pass. */
export function passContentChanged(before: Shop, after: Shop): boolean {
  return PASS_FIELDS.some((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
}

/**
 * Fan out a shop-wide change to every wallet holding one of its cards. Apple passes only refresh
 * when APNs tells the device to re-fetch, so without this an owner's settings save reaches the web
 * card immediately and the wallet pass not until that card's next stamp.
 */
export async function notifyShopWallets(shop: Shop): Promise<void> {
  const jobs: Array<{ provider: string; run: () => Promise<void> }> = [
    { provider: "apple", run: () => pushToShopCards(shop.id) },
    { provider: "google", run: () => updateGoogleObjects(shop) },
  ];
  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error("[wallet] shop update failed", { provider: jobs[i].provider, shopId: shop.id }, r.reason);
  });
}

/** Schedule the shop-wide fan-out after the response is sent (Vercel) or fire-and-forget locally. */
export function scheduleShopWalletUpdate(shop: Shop): void {
  const p = notifyShopWallets(shop).catch((e) => console.error("[wallet] scheduleShopWalletUpdate", e));
  try {
    waitUntil(p);
  } catch {
    /* outside a request context (tests/scripts): let it run detached */
  }
}
