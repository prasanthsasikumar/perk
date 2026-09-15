import { and, eq } from "drizzle-orm";
import type { Db, DbOrTx, Tx } from "@/lib/db/client";
import { cards, events, shops, type Card, type Event, type EventSource, type NewEvent, type Shop } from "@/lib/db/schema";
import { CardNotFound, CooldownActive, NoRewardAvailable, ShopNotFound } from "./errors";
import { applyStamp } from "./tiers";
import { generateShortCode, looksLikeShortCode, normalizeShortCode } from "@/lib/security/short-code";
import { randomToken } from "@/lib/security/random";

export type Actor = { source: EventSource; actor?: string | null };
export type MutationResult = {
  card: Card;
  events: Event[];
  duplicate?: boolean;
  /** True when this mutation banked at least one reward. */
  rewardEarned?: boolean;
  /** Labels banked by this mutation, in order. */
  rewardsEarned?: string[];
  /** Label handed over by a redeem. */
  redeemed?: string;
};

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

function rewardEvent(shopId: string, cardId: string, who: Actor, reward: string, now: Date): NewEvent {
  return { shopId, cardId, type: "reward_earned", delta: 0, source: who.source, actor: who.actor ?? null, note: reward, createdAt: now };
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

    const step = applyStamp({ stamps: card.stamps, pendingRewards: card.pendingRewards }, shop);
    const pending: NewEvent[] = [{ shopId, cardId, type: "stamp", delta: 1, source: who.source, actor: who.actor ?? null, createdAt: now }];
    if (step.earned) pending.push(rewardEvent(shopId, cardId, who, step.earned, now));
    const [updated] = await tx
      .update(cards)
      .set({ stamps: step.stamps, pendingRewards: step.pendingRewards, lastStampedAt: now, updatedAt: now })
      .where(eq(cards.id, cardId))
      .returning();
    const evs = await appendEvents(tx, pending);
    return { card: updated, events: evs, rewardEarned: step.earned !== null, rewardsEarned: step.earned ? [step.earned] : [] };
  });
}

/**
 * Hand over one banked reward. With `reward` set, the first banked reward with that label
 * is used; otherwise the oldest banked reward.
 */
export async function redeemReward(db: Db, shopId: string, cardId: string, who: Actor, now: Date = new Date(), reward?: string): Promise<MutationResult> {
  return db.transaction(async (tx) => {
    const { card } = await lockCard(tx, shopId, cardId);
    const idx = reward === undefined ? (card.pendingRewards.length ? 0 : -1) : card.pendingRewards.indexOf(reward);
    if (idx < 0) throw new NoRewardAvailable();
    const label = card.pendingRewards[idx];
    const remaining = [...card.pendingRewards.slice(0, idx), ...card.pendingRewards.slice(idx + 1)];
    const [updated] = await tx.update(cards).set({ pendingRewards: remaining, updatedAt: now }).where(eq(cards.id, cardId)).returning();
    const evs = await appendEvents(tx, [{ shopId, cardId, type: "redeem", delta: 0, source: who.source, actor: who.actor ?? null, note: label, createdAt: now }]);
    return { card: updated, events: evs, redeemed: label };
  });
}

/**
 * Owner correction. Positive deltas replay the stamp rules one stamp at a time (so bonus tiers
 * and the final reward are banked exactly as if the stamps had been scanned); negative deltas
 * remove progress on the current card, never below zero and never un-banking a reward.
 */
export async function adjustStamps(db: Db, shopId: string, cardId: string, delta: number, note: string, who: Actor, now: Date = new Date()): Promise<MutationResult> {
  if (!Number.isInteger(delta) || delta === 0) throw new Error("delta must be a non-zero integer");
  return db.transaction(async (tx) => {
    const { card, shop } = await lockCard(tx, shopId, cardId);
    let state = { stamps: card.stamps, pendingRewards: card.pendingRewards };
    const earned: string[] = [];
    let applied: number;
    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        const step = applyStamp(state, shop);
        if (step.earned) earned.push(step.earned);
        state = { stamps: step.stamps, pendingRewards: step.pendingRewards };
      }
      applied = delta;
    } else {
      const next = Math.max(0, card.stamps + delta);
      applied = next - card.stamps;
      state = { ...state, stamps: next };
    }
    const pending: NewEvent[] = [{ shopId, cardId, type: "adjust", delta: applied, source: who.source, actor: who.actor ?? null, note, createdAt: now }];
    for (const label of earned) pending.push(rewardEvent(shopId, cardId, who, label, now));
    const [updated] = await tx.update(cards).set({ stamps: state.stamps, pendingRewards: state.pendingRewards, updatedAt: now }).where(eq(cards.id, cardId)).returning();
    const evs = await appendEvents(tx, pending);
    return { card: updated, events: evs, rewardEarned: earned.length > 0, rewardsEarned: earned };
  });
}
