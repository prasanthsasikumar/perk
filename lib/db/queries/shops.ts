import { and, eq, gt, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/lib/db/client";
import { cards, owners, shopOwners, shops, type Shop } from "@/lib/db/schema";
import { InvalidSlug, SlugTaken } from "@/lib/domain/errors";
import { isValidSlug } from "@/lib/slug";
import { randomPin, randomToken } from "@/lib/security/random";

export type ShopSettingsPatch = Partial<
  Pick<Shop, "name" | "logoUrl" | "brandColor" | "stampsRequired" | "rewardText" | "stampMode" | "customerScanCooldownMin">
>;

export type CreateShopInput = { name: string; slug: string } & Omit<ShopSettingsPatch, "name">;

export type PublicShop = Pick<Shop, "id" | "slug" | "name" | "logoUrl" | "brandColor" | "stampsRequired" | "rewardText" | "stampMode">;

export function publicShop(shop: Shop): PublicShop {
  const { id, slug, name, logoUrl, brandColor, stampsRequired, rewardText, stampMode } = shop;
  return { id, slug, name, logoUrl, brandColor, stampsRequired, rewardText, stampMode };
}

export async function createShopForOwner(db: Db, ownerEmail: string, input: CreateShopInput): Promise<Shop> {
  const slug = input.slug.trim().toLowerCase();
  if (!isValidSlug(slug)) throw new InvalidSlug();
  const email = ownerEmail.trim().toLowerCase();
  return db.transaction(async (tx) => {
    const taken = await tx.select({ id: shops.id }).from(shops).where(eq(shops.slug, slug));
    if (taken.length) throw new SlugTaken();
    let [owner] = await tx.select().from(owners).where(eq(owners.email, email));
    if (!owner) [owner] = await tx.insert(owners).values({ email }).returning();
    const { slug: _s, ...rest } = input;
    void _s;
    const [shop] = await tx
      .insert(shops)
      .values({ ...rest, slug, staffPin: randomPin(), qrSecret: randomToken(32) })
      .returning();
    await tx.insert(shopOwners).values({ shopId: shop.id, ownerId: owner.id });
    return shop;
  });
}

export async function getShopBySlug(db: DbOrTx, slug: string): Promise<Shop | null> {
  const rows = await db.select().from(shops).where(eq(shops.slug, slug.toLowerCase()));
  return rows[0] ?? null;
}

export async function getShopById(db: DbOrTx, shopId: string): Promise<Shop | null> {
  const rows = await db.select().from(shops).where(eq(shops.id, shopId));
  return rows[0] ?? null;
}

export async function getShopForOwnerEmail(db: DbOrTx, email: string): Promise<Shop | null> {
  const rows = await db
    .select({ shop: shops })
    .from(owners)
    .innerJoin(shopOwners, eq(shopOwners.ownerId, owners.id))
    .innerJoin(shops, eq(shops.id, shopOwners.shopId))
    .where(eq(owners.email, email.trim().toLowerCase()))
    .limit(1);
  return rows[0]?.shop ?? null;
}

/**
 * Update program/branding settings. Bumps every card's updated_at so Apple devices
 * re-fetch passes, and clamps card progress if stamps_required was lowered.
 */
export async function updateShopSettings(db: Db, shopId: string, patch: ShopSettingsPatch): Promise<Shop> {
  const now = new Date();
  return db.transaction(async (tx) => {
    const [shop] = await tx.update(shops).set({ ...patch, updatedAt: now }).where(eq(shops.id, shopId)).returning();
    if (!shop) throw new Error("shop not found");
    if (patch.stampsRequired !== undefined) {
      await tx
        .update(cards)
        .set({ stamps: shop.stampsRequired - 1 })
        .where(and(eq(cards.shopId, shopId), gt(cards.stamps, shop.stampsRequired - 1)));
    }
    await tx.update(cards).set({ updatedAt: now }).where(eq(cards.shopId, shopId));
    return shop;
  });
}

export async function rotateStaffPin(db: DbOrTx, shopId: string): Promise<Shop> {
  const [shop] = await db
    .update(shops)
    .set({ staffPin: randomPin(), staffPinVersion: sql`${shops.staffPinVersion} + 1`, updatedAt: new Date() })
    .where(eq(shops.id, shopId))
    .returning();
  return shop;
}

export async function rotateQrSecret(db: DbOrTx, shopId: string): Promise<Shop> {
  const [shop] = await db.update(shops).set({ qrSecret: randomToken(32), updatedAt: new Date() }).where(eq(shops.id, shopId)).returning();
  return shop;
}

export async function setGoogleClassId(db: DbOrTx, shopId: string, classId: string): Promise<void> {
  await db.update(shops).set({ googleClassId: classId }).where(eq(shops.id, shopId));
}
