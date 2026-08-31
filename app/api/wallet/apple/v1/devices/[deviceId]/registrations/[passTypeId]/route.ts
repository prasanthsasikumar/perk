import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cards, walletRegistrations } from "@/lib/db/schema";

/** Serial numbers for passes on this device that changed since `passesUpdatedSince` (ms epoch string). */
export async function GET(req: Request, ctx: RouteContext<"/api/wallet/apple/v1/devices/[deviceId]/registrations/[passTypeId]">) {
  const { deviceId } = await ctx.params;
  const since = new URL(req.url).searchParams.get("passesUpdatedSince");
  const sinceDate = since && /^\d+$/.test(since) ? new Date(Number(since)) : null;
  const conds = [eq(walletRegistrations.deviceLibraryId, deviceId)];
  if (sinceDate) conds.push(gt(cards.updatedAt, sinceDate));
  const rows = await db
    .select({ id: cards.id, updatedAt: cards.updatedAt })
    .from(walletRegistrations)
    .innerJoin(cards, eq(cards.id, walletRegistrations.cardId))
    .where(and(...conds));
  if (rows.length === 0) return new Response(null, { status: 204 });
  const lastUpdated = Math.max(...rows.map((r) => r.updatedAt.getTime()));
  return Response.json({ serialNumbers: rows.map((r) => r.id), lastUpdated: String(lastUpdated) });
}
