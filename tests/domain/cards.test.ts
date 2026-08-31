import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, fakeShop } from "../helpers/db";
import { shops, events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createCard, lookupCard, stampCard, redeemReward, adjustStamps } from "@/lib/domain/cards";
import { CardNotFound, CooldownActive, NoRewardAvailable } from "@/lib/domain/errors";

let t: Awaited<ReturnType<typeof createTestDb>>;
let shopA: string, shopB: string, customerShop: string;
const barista = { source: "barista_scan" as const, actor: "staff" };
const T0 = new Date("2026-03-01T10:00:00Z");
const at = (s: number) => new Date(T0.getTime() + s * 1000);

beforeAll(async () => {
  t = await createTestDb();
  [{ id: shopA }] = await t.db.insert(shops).values(fakeShop({ slug: "a", stampsRequired: 5 })).returning({ id: shops.id });
  [{ id: shopB }] = await t.db.insert(shops).values(fakeShop({ slug: "b" })).returning({ id: shops.id });
  [{ id: customerShop }] = await t.db.insert(shops).values(fakeShop({ slug: "c", stampMode: "customer", customerScanCooldownMin: 15 })).returning({ id: shops.id });
});
afterAll(async () => { await t.close(); });

describe("createCard / lookupCard", () => {
  it("creates an anonymous card with a short code, token and a card_created event", async () => {
    const { card, events: evs } = await createCard(t.db, shopA);
    expect(card.shortCode).toHaveLength(8);
    expect(card.appleAuthToken.length).toBeGreaterThan(20);
    expect(card.email).toBeNull();
    expect(evs.map((e) => e.type)).toEqual(["card_created"]);
  });
  it("looks up by id and by short code (case-insensitive, dashes ignored)", async () => {
    const { card } = await createCard(t.db, shopA);
    expect((await lookupCard(t.db, shopA, card.id))?.id).toBe(card.id);
    const sc = card.shortCode.toLowerCase();
    expect((await lookupCard(t.db, shopA, `${sc.slice(0, 4)}-${sc.slice(4)}`))?.id).toBe(card.id);
    expect(await lookupCard(t.db, shopA, "nope")).toBeNull();
    expect(await lookupCard(t.db, shopB, card.id)).toBeNull(); // tenant scoped
  });
});

describe("stampCard", () => {
  it("increments and records a stamp event", async () => {
    const { card } = await createCard(t.db, shopA);
    const r = await stampCard(t.db, shopA, card.id, barista, at(0));
    expect(r.card.stamps).toBe(1);
    expect(r.rewardEarned).toBe(false);
    expect(r.events.map((e) => e.type)).toEqual(["stamp"]);
    expect(r.card.lastStampedAt?.toISOString()).toBe(at(0).toISOString());
  });
  it("rolls over to a reward at stamps_required and stacks rewards", async () => {
    const { card } = await createCard(t.db, shopA);
    let r;
    for (let i = 0; i < 5; i++) r = await stampCard(t.db, shopA, card.id, barista, at(i * 10));
    expect(r!.card.stamps).toBe(0);
    expect(r!.card.rewardsAvailable).toBe(1);
    expect(r!.rewardEarned).toBe(true);
    expect(r!.events.map((e) => e.type)).toEqual(["stamp", "reward_earned"]);
    for (let i = 5; i < 10; i++) r = await stampCard(t.db, shopA, card.id, barista, at(i * 10));
    expect(r!.card.rewardsAvailable).toBe(2);
  });
  it("treats a second barista scan within 5s as a duplicate", async () => {
    const { card } = await createCard(t.db, shopA);
    await stampCard(t.db, shopA, card.id, barista, at(0));
    const dup = await stampCard(t.db, shopA, card.id, barista, at(3));
    expect(dup.duplicate).toBe(true);
    expect(dup.card.stamps).toBe(1);
    expect(dup.events).toHaveLength(0);
    const ok = await stampCard(t.db, shopA, card.id, barista, at(6));
    expect(ok.card.stamps).toBe(2);
  });
  it("enforces cooldown for customer scans", async () => {
    const { card } = await createCard(t.db, customerShop);
    await stampCard(t.db, customerShop, card.id, { source: "customer_scan" }, at(0));
    await expect(stampCard(t.db, customerShop, card.id, { source: "customer_scan" }, at(14 * 60))).rejects.toBeInstanceOf(CooldownActive);
    try { await stampCard(t.db, customerShop, card.id, { source: "customer_scan" }, at(60)); } catch (e) {
      expect((e as CooldownActive).retryAt.toISOString()).toBe(at(15 * 60).toISOString());
    }
    const ok = await stampCard(t.db, customerShop, card.id, { source: "customer_scan" }, at(15 * 60));
    expect(ok.card.stamps).toBe(2);
  });
  it("rejects a card from another shop", async () => {
    const { card } = await createCard(t.db, shopA);
    await expect(stampCard(t.db, shopB, card.id, barista)).rejects.toBeInstanceOf(CardNotFound);
  });
});

describe("redeemReward", () => {
  it("fails with no reward, then succeeds and decrements", async () => {
    const { card } = await createCard(t.db, shopA);
    await expect(redeemReward(t.db, shopA, card.id, barista)).rejects.toBeInstanceOf(NoRewardAvailable);
    for (let i = 0; i < 5; i++) await stampCard(t.db, shopA, card.id, barista, at(i * 10));
    const r = await redeemReward(t.db, shopA, card.id, barista, at(100));
    expect(r.card.rewardsAvailable).toBe(0);
    expect(r.events.map((e) => e.type)).toEqual(["redeem"]);
  });
});

describe("adjustStamps", () => {
  const owner = { source: "owner_adjust" as const, actor: "owner@x.com" };
  it("adds and clamps at zero", async () => {
    const { card } = await createCard(t.db, shopA);
    let r = await adjustStamps(t.db, shopA, card.id, 3, "missed stamps", owner);
    expect(r.card.stamps).toBe(3);
    expect(r.events[0]).toMatchObject({ type: "adjust", delta: 3, note: "missed stamps", actor: "owner@x.com" });
    r = await adjustStamps(t.db, shopA, card.id, -5, "oops", owner);
    expect(r.card.stamps).toBe(0);
    expect(r.events[0].delta).toBe(-3);
  });
  it("rolls over into a reward", async () => {
    const { card } = await createCard(t.db, shopA);
    const r = await adjustStamps(t.db, shopA, card.id, 7, "bulk", owner);
    expect(r.card.stamps).toBe(0);
    expect(r.card.rewardsAvailable).toBe(1);
    expect(r.rewardEarned).toBe(true);
    expect(r.events.map((e) => e.type)).toEqual(["adjust", "reward_earned"]);
    expect(r.events[0].delta).toBe(5);
  });
  it("writes events scoped to the shop", async () => {
    const { card } = await createCard(t.db, shopA);
    await adjustStamps(t.db, shopA, card.id, 1, "x", owner);
    const rows = await t.db.select().from(events).where(eq(events.cardId, card.id));
    expect(rows.every((e) => e.shopId === shopA)).toBe(true);
  });
});
