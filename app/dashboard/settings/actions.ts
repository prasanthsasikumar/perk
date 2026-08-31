"use server";

import { revalidatePath } from "next/cache";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { rotateQrSecret, rotateStaffPin, updateShopSettings } from "@/lib/db/queries/shops";
import { fieldErrors, formToObject, shopSettingsSchema, SETTINGS_KEYS, type FieldErrors } from "@/lib/validation/shop";
import { isStorageConfigured, uploadLogo } from "@/lib/storage/logos";
import { updateGoogleClass } from "@/lib/wallet/google";

export type SettingsState = { ok?: boolean; errors?: FieldErrors };

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const { shop } = await requireShop();
  const values = formToObject(formData, SETTINGS_KEYS);
  const parsed = shopSettingsSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  let logoUrl: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (!isStorageConfigured()) return { errors: { logo: "Logo uploads aren't configured on this server yet." } };
    try { logoUrl = await uploadLogo(shop.slug, logo); } catch (e) { return { errors: { logo: e instanceof Error ? e.message : "Upload failed" } }; }
  }
  const updated = await updateShopSettings(db, shop.id, { ...parsed.data, ...(logoUrl ? { logoUrl } : {}) });
  const brandingChanged = updated.name !== shop.name || updated.brandColor !== shop.brandColor || updated.logoUrl !== shop.logoUrl;
  if (brandingChanged) updateGoogleClass(updated).catch((e) => console.error("[google] class update failed", e));
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function rotatePin(): Promise<void> {
  const { shop } = await requireShop();
  await rotateStaffPin(db, shop.id);
  revalidatePath("/dashboard", "layout");
}

export async function rotateQr(): Promise<void> {
  const { shop } = await requireShop();
  await rotateQrSecret(db, shop.id);
  revalidatePath("/dashboard", "layout");
}
