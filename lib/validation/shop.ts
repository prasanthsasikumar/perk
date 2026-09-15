import { z } from "zod";
import { isValidSlug } from "@/lib/slug";
import { STAMP_STYLES } from "@/lib/db/schema";

export const MAX_BONUS_TIERS = 3;

const rewardLabel = z.string().trim().min(2, "Describe the reward").max(80, "Keep it under 80 characters");

const bonusTier = z.object({ stamps: z.coerce.number().int().min(1), reward: rewardLabel });

/** Bonus tiers arrive as a JSON string from the settings form; missing/blank means none. */
const rewardTiersField = z
  .string()
  .optional()
  .transform((raw, ctx) => {
    if (!raw || !raw.trim()) return [] as { stamps: number; reward: string }[];
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { ctx.addIssue({ code: "custom", message: "Bonus rewards are malformed" }); return z.NEVER; }
    const r = z.array(bonusTier).max(MAX_BONUS_TIERS, `At most ${MAX_BONUS_TIERS} bonus rewards`).safeParse(parsed);
    if (!r.success) { ctx.addIssue({ code: "custom", message: r.error.issues[0]?.message ?? "Check the bonus rewards" }); return z.NEVER; }
    return r.data;
  });

export const shopSettingsSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
    brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
    stampsRequired: z.coerce.number().int().min(3, "At least 3 stamps").max(30, "At most 30 stamps"),
    rewardText: rewardLabel,
    rewardTiers: rewardTiersField,
    stampStyle: z.enum(STAMP_STYLES).default("check"),
    stampMode: z.enum(["barista", "customer"]),
    customerScanCooldownMin: z.coerce.number().int().min(1).max(1440),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<number>();
    for (const t of v.rewardTiers) {
      if (t.stamps >= v.stampsRequired) ctx.addIssue({ code: "custom", path: ["rewardTiers"], message: `Bonus rewards must need fewer than ${v.stampsRequired} stamps` });
      if (seen.has(t.stamps)) ctx.addIssue({ code: "custom", path: ["rewardTiers"], message: "Two bonus rewards can't need the same number of stamps" });
      seen.add(t.stamps);
    }
  })
  .transform((v) => ({ ...v, rewardTiers: [...v.rewardTiers].sort((a, b) => a.stamps - b.stamps) }));

export const onboardingSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
    brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
    stampsRequired: z.coerce.number().int().min(3, "At least 3 stamps").max(30, "At most 30 stamps"),
    rewardText: rewardLabel,
    stampMode: z.enum(["barista", "customer"]),
    customerScanCooldownMin: z.coerce.number().int().min(1).max(1440),
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

export const ONBOARDING_KEYS = ["name", "brandColor", "stampsRequired", "rewardText", "stampMode", "customerScanCooldownMin"];
export const SETTINGS_KEYS = [...ONBOARDING_KEYS, "rewardTiers", "stampStyle"];
