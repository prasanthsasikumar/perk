import type { DbOrTx } from "@/lib/db/client";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { RateLimited } from "@/lib/domain/errors";

export function resolveOwnerLanding(hasShop: boolean): "/dashboard" | "/onboarding" {
  return hasShop ? "/dashboard" : "/onboarding";
}

export const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60_000 };

export async function assertLoginAllowed(dbx: DbOrTx, email: string, now = new Date()): Promise<void> {
  const r = await checkRateLimit(dbx, `login:${email.trim().toLowerCase()}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs, now);
  if (!r.allowed) throw new RateLimited();
}
