import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Shop } from "@/lib/db/schema";
import { createTestDb } from "../helpers/db";
import { walletRegistrations } from "@/lib/db/schema";
import { createShopForOwner } from "@/lib/db/queries/shops";
import { createCard } from "@/lib/domain/cards";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

// apns.ts reads the shared db singleton; point it at the in-memory one.
vi.mock("@/lib/db/client", async () => ({ get db() { return t.db; } }));

const shopFields = (over: Partial<Shop> = {}) =>
  ({ id: "s1", name: "Blue Bottle", logoUrl: null, brandColor: "#751e68", stampsRequired: 10, rewardText: "Free coffee", rewardTiers: [], stampStyle: "check", stampMode: "barista", customerScanCooldownMin: 15, ...over }) as Shop;

describe("passContentChanged", () => {
  it("fires on the fields a customer sees on the pass", async () => {
    const { passContentChanged } = await import("@/lib/wallet");
    const before = shopFields();
    expect(passContentChanged(before, shopFields({ stampsRequired: 5 }))).toBe(true);
    expect(passContentChanged(before, shopFields({ rewardTiers: [{ stamps: 5, reward: "Free muffin" }] }))).toBe(true);
    expect(passContentChanged(before, shopFields({ rewardText: "Free gelato" }))).toBe(true);
    expect(passContentChanged(before, shopFields({ brandColor: "#000000" }))).toBe(true);
    expect(passContentChanged(before, shopFields({ name: "Red Bottle" }))).toBe(true);
  });
  it("stays quiet for settings the pass does not render", async () => {
    const { passContentChanged } = await import("@/lib/wallet");
    const before = shopFields();
    expect(passContentChanged(before, shopFields({ stampMode: "customer" }))).toBe(false);
    expect(passContentChanged(before, shopFields({ customerScanCooldownMin: 30 }))).toBe(false);
    expect(passContentChanged(before, shopFields())).toBe(false);
  });
});

describe("pushToShopCards", () => {
  it("reaches every device registered against any card in the shop, and no other shop's", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { pushToShopCards } = await import("@/lib/wallet/apns");

    const shop = await createShopForOwner(t.db, "owner@example.com", { name: "Fanout", slug: "fanout", stampsRequired: 10 });
    const other = await createShopForOwner(t.db, "other@example.com", { name: "Other", slug: "other", stampsRequired: 10 });
    const { card: a } = await createCard(t.db, shop.id);
    const { card: b } = await createCard(t.db, shop.id);
    const { card: c } = await createCard(t.db, other.id);
    await t.db.insert(walletRegistrations).values([
      { deviceLibraryId: "dev-1", cardId: a.id, pushToken: "tok-1" },
      { deviceLibraryId: "dev-2", cardId: a.id, pushToken: "tok-2" },
      { deviceLibraryId: "dev-3", cardId: b.id, pushToken: "tok-3" },
      { deviceLibraryId: "dev-4", cardId: c.id, pushToken: "tok-4" },
    ]);

    // APNs credentials are absent under test, so the dry-run line is the observable outcome.
    await pushToShopCards(shop.id);
    expect(log).toHaveBeenCalledWith(`[apns] dry-run: would push 3 device(s) for shop ${shop.id}`);

    log.mockClear();
    await pushToShopCards(other.id);
    expect(log).toHaveBeenCalledWith(`[apns] dry-run: would push 1 device(s) for shop ${other.id}`);
    log.mockRestore();
  });

  it("is a no-op when nobody has added the pass yet", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { pushToShopCards } = await import("@/lib/wallet/apns");
    const empty = await createShopForOwner(t.db, "empty@example.com", { name: "Empty", slug: "empty" });
    await pushToShopCards(empty.id);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
