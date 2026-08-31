import { z } from "zod";
import { isValidSlug } from "@/lib/slug";

export const shopSettingsSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
  stampsRequired: z.coerce.number().int().min(3, "At least 3 stamps").max(30, "At most 30 stamps"),
  rewardText: z.string().trim().min(2, "Describe the reward").max(80, "Keep it under 80 characters"),
  stampMode: z.enum(["barista", "customer"]),
  customerScanCooldownMin: z.coerce.number().int().min(1).max(1440),
});

export const onboardingSchema = shopSettingsSchema.extend({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine(isValidSlug, "Use 3–40 lowercase letters, numbers or dashes (some words are reserved)"),
});

export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type FieldErrors = Record<string, string>;

export function fieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function formToObject(formData: FormData, keys: string[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") o[k] = v;
  }
  return o;
}

export const SETTINGS_KEYS = ["name", "brandColor", "stampsRequired", "rewardText", "stampMode", "customerScanCooldownMin"];
