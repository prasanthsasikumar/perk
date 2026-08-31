import { and, desc, eq, lt, sql } from "drizzle-orm";
import type { DbOrTx } from "@/lib/db/client";
import { cards, events, type Event, type EventType } from "@/lib/db/schema";
import { countCards } from "./cards";

export type ShopStats = { totalCards: number; stampsToday: number; stamps7d: number; rewardsEarned: number; rewardsRedeemed: number };

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function getShopStats(db: DbOrTx, shopId: string, now: Date = new Date()): Promise<ShopStats> {
  const dayStart = startOfUtcDay(now);
  const weekStart = new Date(now.getTime() - 7 * 86_400_000);
  const [agg] = await db
    .select({
      stampsToday: sql<number>`coalesce(sum(case when ${events.type} = 'stamp' and ${events.createdAt} >= ${dayStart} then ${events.delta} else 0 end), 0)::int`,
      stamps7d: sql<number>`coalesce(sum(case when ${events.type} = 'stamp' and ${events.createdAt} >= ${weekStart} then ${events.delta} else 0 end), 0)::int`,
      rewardsEarned: sql<number>`count(*) filter (where ${events.type} = 'reward_earned')::int`,
      rewardsRedeemed: sql<number>`count(*) filter (where ${events.type} = 'redeem')::int`,
    })
    .from(events)
    .where(eq(events.shopId, shopId));
  const totalCards = await countCards(db, shopId);
  return { totalCards, stampsToday: agg?.stampsToday ?? 0, stamps7d: agg?.stamps7d ?? 0, rewardsEarned: agg?.rewardsEarned ?? 0, rewardsRedeemed: agg?.rewardsRedeemed ?? 0 };
}

export type ListEventsOptions = { limit?: number; cursor?: number | null; type?: EventType; cardId?: string };
export type EventRow = Event & { cardShortCode: string };
export type ListEventsResult = { items: EventRow[]; nextCursor: number | null };

export async function listEvents(db: DbOrTx, shopId: string, opts: ListEventsOptions = {}): Promise<ListEventsResult> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const conds = [eq(events.shopId, shopId)];
  if (opts.type) conds.push(eq(events.type, opts.type));
  if (opts.cardId) conds.push(eq(events.cardId, opts.cardId));
  if (opts.cursor) conds.push(lt(events.id, opts.cursor));
  const rows = await db
    .select({ ev: events, cardShortCode: cards.shortCode })
    .from(events)
    .innerJoin(cards, eq(cards.id, events.cardId))
    .where(and(...conds))
    .orderBy(desc(events.id))
    .limit(limit + 1);
  const items = rows.slice(0, limit).map((r) => ({ ...r.ev, cardShortCode: r.cardShortCode }));
  const nextCursor = rows.length > limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
}

export async function recentEvents(db: DbOrTx, shopId: string, limit = 10): Promise<EventRow[]> {
  return (await listEvents(db, shopId, { limit })).items;
}

