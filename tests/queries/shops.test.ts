import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb } from "../helpers/db";
import { createShopForOwner, getShopBySlug, getShopForOwnerEmail, updateShopSettings, rotateStaffPin, rotateQrSecret, publicShop } from "@/lib/db/queries/shops";
import { InvalidSlug, SlugTaken } from "@/lib/domain/errors";
import { createCard, adjustStamps } from "@/lib/domain/cards";
import { getCard } from "@/lib/db/queries/cards";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

describe("shops", () => {
  it("creates a shop + owner with generated pin and secret", async () => {
    const shop = await createShopForOwner(t.db, "Owner@Example.com", { name: "Blue Bottle", slug: "Blue-Bottle", stampsRequired: 8 });
    expect(shop.slug).toBe("blue-bottle");
    expect(shop.staffPin).toMatch(/^\d{6}$/);
    expect(shop.qrSecret.length).toBeGreaterThan(20);
    expect((await getShopForOwnerEmail(t.db, "owner@example.com"))?.id).toBe(shop.id);
    expect((await getShopBySlug(t.db, "blue-bottle"))?.id).toBe(shop.id);
    expect(publicShop(shop)).not.toHaveProperty("staffPin");
  });
  it("rejects reserved/invalid and duplicate slugs", async () => {
    await expect(createShopForOwner(t.db, "a@b.c", { name: "X", slug: "dashboard" })).rejects.toBeInstanceOf(InvalidSlug);
    await expect(createShopForOwner(t.db, "a@b.c", { name: "X", slug: "blue-bottle" })).rejects.toBeInstanceOf(SlugTaken);
  });
  it("lowering stamps_required clamps card progress and bumps updated_at", async () => {
    const shop = await createShopForOwner(t.db, "c@d.e", { name: "Clamp", slug: "clamp", stampsRequired: 10 });
    const { card } = await createCard(t.db, shop.id);
    await adjustStamps(t.db, shop.id, card.id, 7, "seed", { source: "owner_adjust" });
    const before = (await getCard(t.db, shop.id, card.id))!;
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateShopSettings(t.db, shop.id, { stampsRequired: 5, rewardText: "Free flat white" });
    expect(updated.stampsRequired).toBe(5);
    const after = (await getCard(t.db, shop.id, card.id))!;
    expect(after.stamps).toBe(4);
    expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
  });
  it("rotates pin and qr secret", async () => {
    const shop = await createShopForOwner(t.db, "r@d.e", { name: "Rot", slug: "rotate" });
    const p = await rotateStaffPin(t.db, shop.id);
    expect(p.staffPinVersion).toBe(2);
    const q = await rotateQrSecret(t.db, shop.id);
    expect(q.qrSecret).not.toBe(shop.qrSecret);
  });
});
