import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().default("postgres://unused"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  AUTH_SECRET: z.string().default("dev-secret-change-me"),
  AUTH_RESEND_KEY: z.string().optional(),
  AUTH_EMAIL_FROM: z.string().default("Perk <login@perk.app>"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_LOGO_BUCKET: z.string().default("logos"),
  STAFF_COOKIE_SECRET: z.string().default("dev-staff-secret-change-me"),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_PASS_TYPE_ID: z.string().default("pass.app.perk.card"),
  APPLE_PASS_CERT_PEM: z.string().optional(),
  APPLE_PASS_KEY_PEM: z.string().optional(),
  APPLE_PASS_KEY_PASSPHRASE: z.string().optional(),
  APPLE_WWDR_PEM: z.string().optional(),
  APNS_KEY_ID: z.string().optional(),
  APNS_TEAM_ID: z.string().optional(),
  APNS_KEY_PEM: z.string().optional(),
  GOOGLE_WALLET_ISSUER_ID: z.string().optional(),
  GOOGLE_WALLET_SA_EMAIL: z.string().optional(),
  GOOGLE_WALLET_SA_KEY_PEM: z.string().optional(),
  WALLET_DRY_RUN: z.string().optional(),
});

export type Env = z.infer<typeof schema> & { WALLET_DRY_RUN_BOOL: boolean };

let cached: Env | null = null;

/** Validated process.env. Lazy so tests can set variables before first access. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.parse(process.env);
  cached = {
    ...parsed,
    WALLET_DRY_RUN_BOOL: parsed.WALLET_DRY_RUN === "1" || parsed.WALLET_DRY_RUN === "true",
  };
  return cached;
}

/** Test hook: forget the cached env. */
export function resetEnvCache() {
  cached = null;
}

/** Decode a base64-encoded PEM env var; raw PEM passes through; undefined stays undefined. */
export function pemFromEnv(v: string | undefined): string | undefined {
  if (!v) return undefined;
  return v.includes("-----BEGIN") ? v : Buffer.from(v, "base64").toString("utf8");
}
