import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb } from "../helpers/db";
import { createShopForOwner } from "@/lib/db/queries/shops";
import { listCards, setCardEmail, getCardByIdAny } from "@/lib/db/queries/cards";
import { getShopStats, listEvents } from "@/lib/db/queries/events";
import { createCard, stampCard, redeemReward } from "@/lib/domain/cards";

let t: Awaited<ReturnType<typeof createTestDb>>;
let shopId: string;
const NOW = new Date("2026-06-10T12:00:00Z");
const barista = { source: "barista_scan" as const, actor: "staff" };

beforeAll(async () => {
  t = await createTestDb();
  shopId = (await createShopForOwner(t.db, "o@o.o", { name: "S", slug: "stats", stampsRequired: 3 })).id;
});
afterAll(async () => { await t.close(); });

describe("cards + events queries", () => {
  it("stats and listing", async () => {
    const a = (await createCard(t.db, shopId)).card;
    const b = (await createCard(t.db, shopId)).card;
    await setCardEmail(t.db, shopId, a.id, "Alice@Example.com");
    // 3 stamps on a today → reward; 1 stamp on b 3 days ago
    for (let i = 0; i < 3; i++) await stampCard(t.db, shopId, a.id, barista, new Date(NOW.getTime() + i * 10_000));
    await stampCard(t.db, shopId, b.id, barista, new Date(NOW.getTime() - 3 * 86_400_000));
    await redeemReward(t.db, shopId, a.id, barista, new Date(NOW.getTime() + 60_000));

    const s = await getShopStats(t.db, shopId, new Date(NOW.getTime() + 120_000));
    expect(s).toEqual({ totalCards: 2, stampsToday: 3, stamps7d: 4, rewardsEarned: 1, rewardsRedeemed: 1 });

    const all = await listCards(t.db, shopId);
    expect(all.items.map((c) => c.id)).toEqual([a.id, b.id]); // most recent first
    expect((await listCards(t.db, shopId, { search: "alice" })).items.map((c) => c.id)).toEqual([a.id]);
    expect((await listCards(t.db, shopId, { search: b.shortCode.toLowerCase() })).items.map((c) => c.id)).toEqual([b.id]);
    const page1 = await listCards(t.db, shopId, { limit: 1 });
    expect(page1.items).toHaveLength(1);
    expect(page1.nextCursor).not.toBeNull();
    const page2 = await listCards(t.db, shopId, { limit: 1, cursor: page1.nextCursor });
    expect(page2.items[0].id).toBe(b.id);
    expect(page2.nextCursor).toBeNull();

    const evs = await listEvents(t.db, shopId, { limit: 3 });
    expect(evs.items).toHaveLength(3);
    expect(evs.items[0].type).toBe("redeem");
    expect(evs.items[0].cardShortCode).toBe(a.shortCode);
    expect(evs.nextCursor).not.toBeNull();
    const only = await listEvents(t.db, shopId, { type: "reward_earned" });
    expect(only.items).toHaveLength(1);
    const forB = await listEvents(t.db, shopId, { cardId: b.id });
    expect(forB.items.map((e) => e.type)).toEqual(["stamp", "card_created"]);

    const any = await getCardByIdAny(t.db, a.id);
    expect(any?.shop.slug).toBe("stats");
  });
});
