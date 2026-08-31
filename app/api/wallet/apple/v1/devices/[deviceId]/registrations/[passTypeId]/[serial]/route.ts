import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { walletRegistrations } from "@/lib/db/schema";
import { authenticatePassRequest } from "@/lib/wallet/apple-auth";

type Ctx = RouteContext<"/api/wallet/apple/v1/devices/[deviceId]/registrations/[passTypeId]/[serial]">;

/** Register a device to receive push notifications for a pass. */
export async function POST(req: Request, ctx: Ctx) {
  const { deviceId, serial } = await ctx.params;
  const found = await authenticatePassRequest(req, serial);
  if (!found) return new Response(null, { status: 401 });
  let pushToken: string | undefined;
  try {
    pushToken = (await req.json())?.pushToken;
  } catch {
    /* fallthrough */
  }
  if (!pushToken) return new Response(null, { status: 400 });
  const existing = await db.select().from(walletRegistrations).where(and(eq(walletRegistrations.deviceLibraryId, deviceId), eq(walletRegistrations.cardId, serial)));
  if (existing.length) {
    await db.update(walletRegistrations).set({ pushToken }).where(and(eq(walletRegistrations.deviceLibraryId, deviceId), eq(walletRegistrations.cardId, serial)));
    return new Response(null, { status: 200 });
  }
  await db.insert(walletRegistrations).values({ deviceLibraryId: deviceId, cardId: serial, pushToken });
  return new Response(null, { status: 201 });
}

/** Unregister a device. */
export async function DELETE(req: Request, ctx: Ctx) {
  const { deviceId, serial } = await ctx.params;
  const found = await authenticatePassRequest(req, serial);
  if (!found) return new Response(null, { status: 401 });
  await db.delete(walletRegistrations).where(and(eq(walletRegistrations.deviceLibraryId, deviceId), eq(walletRegistrations.cardId, serial)));
  return new Response(null, { status: 200 });
}
