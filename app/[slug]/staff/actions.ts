"use server";

import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db/client";
import { getShopBySlug } from "@/lib/db/queries/shops";
import { lookupCard, redeemReward, stampCard } from "@/lib/domain/cards";
import { isDomainError } from "@/lib/domain/errors";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { scheduleWalletUpdate } from "@/lib/wallet";
import { clientIp, grantStaffAccess, hasStaffAccess, revokeStaffAccess } from "@/lib/staff/auth";
import { toCardView, type CardView } from "@/lib/staff/card-view";
import type { Shop } from "@/lib/db/schema";
import { track } from "@/lib/analytics";

export type ActionResult = CardView | { error: string };
export type PinState = { error?: string };

async function requireStaffShop(slug: string): Promise<Shop> {
  const shop = await getShopBySlug(db, slug);
  if (!shop) throw new Error("Shop not found");
  if (!(await hasStaffAccess(shop))) throw new Error("Staff access required");
  return shop;
}

export async function enterStaffPin(slug: string, _prev: PinState, formData: FormData): Promise<PinState> {
  const shop = await getShopBySlug(db, slug);
  if (!shop) return { error: "Shop not found." };
  const rl = await checkRateLimit(db, `pin:${await clientIp()}`, 10, 15 * 60_000);
  if (!rl.allowed) return { error: "Too many attempts. Wait 15 minutes and try again." };
  const pin = String(formData.get("pin") ?? "").replace(/\D/g, "");
  const a = Buffer.from(pin);
  const b = Buffer.from(shop.staffPin);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { error: "That PIN isn't right." };
  await grantStaffAccess(shop);
  return {};
}

export async function leaveStaffMode(slug: string): Promise<void> {
  const shop = await getShopBySlug(db, slug);
  if (shop) await revokeStaffAccess(shop);
}

export async function staffLookup(slug: string, idOrCode: string): Promise<ActionResult> {
  const shop = await requireStaffShop(slug);
  const card = await lookupCard(db, shop.id, idOrCode);
  if (!card) return { error: "No card found for that code." };
  return toCardView(shop, card);
}

export async function staffStamp(slug: string, cardId: string): Promise<ActionResult> {
  const shop = await requireStaffShop(slug);
  try {
    const r = await stampCard(db, shop.id, cardId, { source: "barista_scan", actor: "staff" });
    if (!r.duplicate) {
      scheduleWalletUpdate(shop, r.card);
      track("card_stamped", { reward_earned: r.rewardEarned }, { shopSlug: slug });
    }
    return toCardView(shop, r.card, { duplicate: r.duplicate, rewardEarned: r.rewardEarned });
  } catch (e) {
    if (isDomainError(e)) return { error: e.message };
    throw e;
  }
}

export async function staffRedeem(slug: string, cardId: string): Promise<ActionResult> {
  const shop = await requireStaffShop(slug);
  try {
    const r = await redeemReward(db, shop.id, cardId, { source: "barista_scan", actor: "staff" });
    scheduleWalletUpdate(shop, r.card);
    track("reward_redeemed", {}, { shopSlug: slug });
    return toCardView(shop, r.card);
  } catch (e) {
    if (isDomainError(e)) return { error: e.message };
    throw e;
  }
}
