"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { getShopBySlug, publicShop } from "@/lib/db/queries/shops";
import { getCard, setCardEmail } from "@/lib/db/queries/cards";
import { createCard } from "@/lib/domain/cards";
import { readCardCookie, setCardCookie } from "@/lib/cookies/card-cookie";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sendCardLinkEmail } from "@/lib/email/send";
import { getEnv } from "@/lib/env";
import { track } from "@/lib/analytics";
import { z } from "zod";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

/** Reuse the visitor's existing card for this shop (cookie) or create a new one; always sets the cookie. */
export async function getOrCreateCard(slug: string): Promise<{ cardId: string; shopId: string; reused: boolean }> {
  const shop = await getShopBySlug(db, slug);
  if (!shop) redirect("/");
  const existing = await readCardCookie(shop.id);
  if (existing && (await getCard(db, shop.id, existing))) {
    await setCardCookie(shop.id, existing);
    return { cardId: existing, shopId: shop.id, reused: true };
  }
  const ip = await clientIp();
  const rl = await checkRateLimit(db, `card_create:${ip}`, 30, 60 * 60_000);
  if (!rl.allowed) redirect(`/${slug}?error=rate_limited`);
  const { card } = await createCard(db, shop.id);
  await setCardCookie(shop.id, card.id);
  return { cardId: card.id, shopId: shop.id, reused: false };
}

function afterUrl(slug: string, cardId: string, then: string | undefined, token: string | undefined, fallback: string): string {
  if (then === "scan" && token) return `/${slug}/scan?t=${encodeURIComponent(token)}&card=${cardId}`;
  return fallback;
}

async function issue(slug: string, platform: "apple" | "google" | "web"): Promise<string> {
  const { cardId, reused } = await getOrCreateCard(slug);
  track("card_issued", { platform, reused }, { shopSlug: slug });
  return cardId;
}

export async function issueApple(slug: string, then?: string, token?: string): Promise<void> {
  const cardId = await issue(slug, "apple");
  redirect(afterUrl(slug, cardId, then, token, `/api/cards/${cardId}/apple-pass`));
}

export async function issueGoogle(slug: string, then?: string, token?: string): Promise<void> {
  const cardId = await issue(slug, "google");
  redirect(afterUrl(slug, cardId, then, token, `/api/cards/${cardId}/google-save`));
}

export async function issueWeb(slug: string, then?: string, token?: string): Promise<void> {
  const cardId = await issue(slug, "web");
  redirect(afterUrl(slug, cardId, then, token, `/${slug}/card/${cardId}`));
}

/** Called from the web card page on mount when the cookie is missing (e.g. opened from the pass back-link). */
export async function claimCardCookie(slug: string, cardId: string): Promise<void> {
  const shop = await getShopBySlug(db, slug);
  if (!shop) return;
  if (await getCard(db, shop.id, cardId)) await setCardCookie(shop.id, cardId);
}

export type BackupState = { ok?: boolean; error?: string };

export async function backupCardEmail(slug: string, cardId: string, _prev: BackupState, formData: FormData): Promise<BackupState> {
  const parsed = z.string().email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { error: "Enter a valid email address." };
  const shop = await getShopBySlug(db, slug);
  if (!shop) return { error: "Shop not found." };
  const card = await getCard(db, shop.id, cardId);
  if (!card) return { error: "Card not found." };
  const rl = await checkRateLimit(db, `backup:${cardId}`, 3, 60 * 60_000);
  if (!rl.allowed) return { error: "Too many emails sent for this card. Try again later." };
  await setCardEmail(db, shop.id, cardId, parsed.data);
  try {
    await sendCardLinkEmail(parsed.data, publicShop(shop), `${getEnv().NEXT_PUBLIC_APP_URL}/${shop.slug}/card/${cardId}`);
  } catch (e) {
    console.error("[email] backup failed", e);
    return { error: "We saved your email but couldn't send the link. Try again in a minute." };
  }
  track("card_email_backup", {}, { shopSlug: shop.slug });
  return { ok: true };
}
