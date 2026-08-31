import { waitUntil } from "@vercel/functions";
import type { Card, Shop } from "@/lib/db/schema";
import { appleWallet } from "./apple";
import { googleWallet } from "./google";

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
