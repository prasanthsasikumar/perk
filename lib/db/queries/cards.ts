import { and, desc, eq, ilike, lt, or, sql } from "drizzle-orm";
import type { DbOrTx } from "@/lib/db/client";
import { cards, shops, type Card, type Shop } from "@/lib/db/schema";
import { looksLikeShortCode, normalizeShortCode } from "@/lib/security/short-code";

export type ListCardsOptions = { search?: string; limit?: number; cursor?: string | null };
export type ListCardsResult = { items: Card[]; nextCursor: string | null };

/**
 * Cards ordered by most recent activity (last_stamped_at, then created_at).
 * Cursor = ISO timestamp of the sort key of the last row.
 */
export async function listCards(db: DbOrTx, shopId: string, opts: ListCardsOptions = {}): Promise<ListCardsResult> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const sortKey = sql<Date>`COALESCE(${cards.lastStampedAt}, ${cards.createdAt})`;
  const conds = [eq(cards.shopId, shopId)];
  if (opts.search?.trim()) {
    const q = opts.search.trim();
    const parts = [ilike(cards.email, `%${q}%`)];
    if (looksLikeShortCode(q)) parts.push(eq(cards.shortCode, normalizeShortCode(q)));
    else parts.push(ilike(cards.shortCode, `${normalizeShortCode(q)}%`));
    conds.push(or(...parts)!);
  }
  if (opts.cursor) conds.push(lt(sortKey, new Date(opts.cursor)));
  const rows = await db.select().from(cards).where(and(...conds)).orderBy(desc(sortKey), desc(cards.id)).limit(limit + 1);
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];
  const nextCursor = rows.length > limit && last ? (last.lastStampedAt ?? last.createdAt).toISOString() : null;
  return { items, nextCursor };
}

export async function getCard(db: DbOrTx, shopId: string, cardId: string): Promise<Card | null> {
  const rows = await db.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.shopId, shopId)));
  return rows[0] ?? null;
}

/** For wallet web-service endpoints that only know the pass serial. */
export async function getCardByIdAny(db: DbOrTx, cardId: string): Promise<{ card: Card; shop: Shop } | null> {
  const rows = await db.select({ card: cards, shop: shops }).from(cards).innerJoin(shops, eq(shops.id, cards.shopId)).where(eq(cards.id, cardId));
  return rows[0] ?? null;
}

export async function setCardEmail(db: DbOrTx, shopId: string, cardId: string, email: string): Promise<void> {
  await db.update(cards).set({ email: email.trim().toLowerCase(), updatedAt: new Date() }).where(and(eq(cards.id, cardId), eq(cards.shopId, shopId)));
}

export async function setGoogleObjectId(db: DbOrTx, shopId: string, cardId: string, objectId: string): Promise<void> {
  await db.update(cards).set({ googleObjectId: objectId }).where(and(eq(cards.id, cardId), eq(cards.shopId, shopId)));
}

export async function countCards(db: DbOrTx, shopId: string): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(cards).where(eq(cards.shopId, shopId));
  return row?.n ?? 0;
}
