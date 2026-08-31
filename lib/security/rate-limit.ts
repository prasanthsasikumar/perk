import { sql } from "drizzle-orm";
import { rateLimits } from "@/lib/db/schema";
import type { DbOrTx } from "@/lib/db/client";

export type RateLimitResult = { allowed: boolean; remaining: number };

/**
 * Fixed-window counter stored in Postgres. One upsert per check.
 * The window restarts when the stored window_start is older than `windowMs`.
 */
export async function checkRateLimit(
  db: DbOrTx,
  key: string,
  limit: number,
  windowMs: number,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const cutoff = new Date(now.getTime() - windowMs);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.windowStart} < ${cutoff} THEN 1 ELSE ${rateLimits.count} + 1 END`,
        windowStart: sql`CASE WHEN ${rateLimits.windowStart} < ${cutoff} THEN ${now} ELSE ${rateLimits.windowStart} END`,
      },
    })
    .returning();
  return { allowed: row.count <= limit, remaining: Math.max(0, limit - row.count) };
}
