import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, fakeShop } from "../helpers/db";
import { shops, cards } from "@/lib/db/schema";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

describe("schema", () => {
  it("inserts a shop with defaults and a card", async () => {
    const [shop] = await t.db.insert(shops).values(fakeShop()).returning();
    expect(shop.stampsRequired).toBe(10);
    expect(shop.stampMode).toBe("barista");
    expect(shop.customerScanCooldownMin).toBe(15);
    const [card] = await t.db.insert(cards).values({ shopId: shop.id, shortCode: "ABCD2345", appleAuthToken: "tok" }).returning();
    expect(card.stamps).toBe(0);
    expect(card.rewardsAvailable).toBe(0);
  });

  it("enforces unique short_code per shop", async () => {
    const [shop] = await t.db.insert(shops).values(fakeShop({ slug: "other" })).returning();
    await t.db.insert(cards).values({ shopId: shop.id, shortCode: "SAME1234", appleAuthToken: "a" });
    await expect(
      t.db.insert(cards).values({ shopId: shop.id, shortCode: "SAME1234", appleAuthToken: "b" }),
    ).rejects.toThrow();
  });
});
