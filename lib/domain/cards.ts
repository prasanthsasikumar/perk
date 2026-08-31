import { and, eq } from "drizzle-orm";
import type { Db, DbOrTx, Tx } from "@/lib/db/client";
import { cards, events, shops, type Card, type Event, type EventSource, type NewEvent, type Shop } from "@/lib/db/schema";
import { CardNotFound, CooldownActive, NoRewardAvailable, ShopNotFound } from "./errors";
import { generateShortCode, looksLikeShortCode, normalizeShortCode } from "@/lib/security/short-code";
import { randomToken } from "@/lib/security/random";

export type Actor = { source: EventSource; actor?: string | null };
export type MutationResult = { card: Card; events: Event[]; duplicate?: boolean; rewardEarned?: boolean };

/** Two barista scans of the same card within this window are treated as one. */
export const DUPLICATE_SCAN_WINDOW_MS = 5_000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function lockCard(tx: Tx, shopId: string, cardId: string): Promise<{ card: Card; shop: Shop }> {
  const rows = await tx.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.shopId, shopId))).for("update");
  const card = rows[0];
  if (!card) throw new CardNotFound();
  const [shop] = await tx.select().from(shops).where(eq(shops.id, shopId));
  if (!shop) throw new ShopNotFound();
  return { card, shop };
}

async function appendEvents(tx: Tx, rows: NewEvent[]): Promise<Event[]> {
  if (rows.length === 0) return [];
  return tx.insert(events).values(rows).returning();
}

export async function createCard(db: Db, shopId: string, opts: { email?: string } = {}): Promise<MutationResult> {
  return db.transaction(async (tx) => {
    const [shop] = await tx.select({ id: shops.id }).from(shops).where(eq(shops.id, shopId));
    if (!shop) throw new ShopNotFound();
    let card: Card | undefined;
    for (let attempt = 0; attempt < 5 && !card; attempt++) {
      const shortCode = generateShortCode();
      const existing = await tx.select({ id: cards.id }).from(cards).where(and(eq(cards.shopId, shopId), eq(cards.shortCode, shortCode)));
      if (existing.length) continue;
      [card] = await tx.insert(cards).values({ shopId, shortCode, appleAuthToken: randomToken(24), email: opts.email ?? null }).returning();
    }
    if (!card) throw new Error("Could not allocate a unique card code");
    const evs = await appendEvents(tx, [{ shopId, cardId: card.id, type: "card_created", delta: 0, source: "system" }]);
    return { card, events: evs };
  });
}

/** Find a card by uuid or by short code, always scoped to the shop. */
export async function lookupCard(db: DbOrTx, shopId: string, idOrCode: string): Promise<Card | null> {
  const raw = idOrCode.trim();
  if (UUID_RE.test(raw)) {
    const rows = await db.select().from(cards).where(and(eq(cards.id, raw.toLowerCase()), eq(cards.shopId, shopId)));
    return rows[0] ?? null;
  }
  if (!looksLikeShortCode(raw)) return null;
  const rows = await db.select().from(cards).where(and(eq(cards.shopId, shopId), eq(cards.shortCode, normalizeShortCode(raw))));
  return rows[0] ?? null;
}

export async function stampCard(db: Db, shopId: string, cardId: string, who: Actor, now: Date = new Date()): Promise<MutationResult> {
  return db.transaction(async (tx) => {
    const { card, shop } = await lockCard(tx, shopId, cardId);
    const last = card.lastStampedAt?.getTime();

    if (who.source === "barista_scan" && last !== undefined && now.getTime() - last < DUPLICATE_SCAN_WINDOW_MS) {
      return { card, events: [], duplicate: true };
    }
    if (who.source === "customer_scan" && last !== undefined) {
      const retryAt = new Date(last + shop.customerScanCooldownMin * 60_000);
      if (retryAt.getTime() > now.getTime()) throw new CooldownActive(retryAt);
    }

    let stamps = card.stamps + 1;
    let rewardsAvailable = card.rewardsAvailable;
    let rewardEarned = false;
    const pending: NewEvent[] = [{ shopId, cardId, type: "stamp", delta: 1, source: who.source, actor: who.actor ?? null, createdAt: now }];
    if (stamps >= shop.stampsRequired) {
      stamps = 0;
      rewardsAvailable += 1;
      rewardEarned = true;
      pending.push({ shopId, cardId, type: "reward_earned", delta: 0, source: who.source, actor: who.actor ?? null, createdAt: now });
    }
    const [updated] = await tx.update(cards).set({ stamps, rewardsAvailable, lastStampedAt: now, updatedAt: now }).where(eq(cards.id, cardId)).returning();
    const evs = await appendEvents(tx, pending);
    return { card: updated, events: evs, rewardEarned };
  });
}

export async function redeemReward(db: Db, shopId: string, cardId: string, who: Actor, now: Date = new Date()): Promise<MutationResult> {
  return db.transaction(async (tx) => {
    const { card } = await lockCard(tx, shopId, cardId);
    if (card.rewardsAvailable < 1) throw new NoRewardAvailable();
    const [updated] = await tx.update(cards).set({ rewardsAvailable: card.rewardsAvailable - 1, updatedAt: now }).where(eq(cards.id, cardId)).returning();
    const evs = await appendEvents(tx, [{ shopId, cardId, type: "redeem", delta: 0, source: who.source, actor: who.actor ?? null, createdAt: now }]);
    return { card: updated, events: evs };
  });
}

export async function adjustStamps(db: Db, shopId: string, cardId: string, delta: number, note: string, who: Actor, now: Date = new Date()): Promise<MutationResult> {
  if (!Number.isInteger(delta) || delta === 0) throw new Error("delta must be a non-zero integer");
  return db.transaction(async (tx) => {
    const { card, shop } = await lockCard(tx, shopId, cardId);
    let next = card.stamps + delta;
    let rewardsAvailable = card.rewardsAvailable;
    let rewardEarned = false;
    if (next < 0) next = 0;
    const pending: NewEvent[] = [];
    if (next >= shop.stampsRequired) {
      rewardsAvailable += 1;
      next = 0;
      rewardEarned = true;
    }
    const applied = rewardEarned ? shop.stampsRequired - card.stamps : next - card.stamps;
    pending.push({ shopId, cardId, type: "adjust", delta: applied, source: who.source, actor: who.actor ?? null, note, createdAt: now });
    if (rewardEarned) pending.push({ shopId, cardId, type: "reward_earned", delta: 0, source: who.source, actor: who.actor ?? null, createdAt: now });
    const [updated] = await tx.update(cards).set({ stamps: next, rewardsAvailable, updatedAt: now }).where(eq(cards.id, cardId)).returning();
    const evs = await appendEvents(tx, pending);
    return { card: updated, events: evs, rewardEarned };
  });
}
