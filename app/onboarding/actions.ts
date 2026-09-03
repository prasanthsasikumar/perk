"use server";

import { redirect } from "next/navigation";
import { requireOwnerEmail } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { createShopForOwner, getShopForOwnerEmail } from "@/lib/db/queries/shops";
import { isDomainError } from "@/lib/domain/errors";
import { fieldErrors, formToObject, onboardingSchema, SETTINGS_KEYS, type FieldErrors } from "@/lib/validation/shop";
import { isStorageConfigured, uploadLogo } from "@/lib/storage/logos";
import { track } from "@/lib/analytics";

export type OnboardingState = { errors?: FieldErrors; values?: Record<string, string> };

export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const ownerEmail = await requireOwnerEmail();
  if (await getShopForOwnerEmail(db, ownerEmail)) redirect("/dashboard");

  const values = formToObject(formData, [...SETTINGS_KEYS, "slug"]);
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  let logoUrl: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (!isStorageConfigured()) return { errors: { logo: "Logo uploads aren't configured yet — skip the logo for now." }, values };
    try {
      logoUrl = await uploadLogo(parsed.data.slug, logo);
    } catch (e) {
      return { errors: { logo: e instanceof Error ? e.message : "Upload failed" }, values };
    }
  }

  try {
    await createShopForOwner(db, ownerEmail, { ...parsed.data, logoUrl });
    track("shop_created", { has_logo: !!logoUrl }, { shopSlug: parsed.data.slug, distinctId: ownerEmail });
  } catch (e) {
    if (isDomainError(e)) return { errors: { slug: e.message }, values };
    throw e;
  }
  redirect("/dashboard?welcome=1");
}
