import { cookies, headers } from "next/headers";
import { getEnv } from "@/lib/env";
import type { Shop } from "@/lib/db/schema";
import { signStaffCookie, staffCookieName, verifyStaffCookie } from "@/lib/security/staff-cookie";

/** True when the request carries a valid staff cookie for this shop's current PIN version. */
export async function hasStaffAccess(shop: Shop): Promise<boolean> {
  const value = (await cookies()).get(staffCookieName(shop.id))?.value;
  const payload = verifyStaffCookie(value, getEnv().STAFF_COOKIE_SECRET);
  return !!payload && payload.shopId === shop.id && payload.pinVersion === shop.staffPinVersion;
}

/** Server actions / route handlers only. */
export async function grantStaffAccess(shop: Shop): Promise<void> {
  (await cookies()).set(staffCookieName(shop.id), signStaffCookie({ shopId: shop.id, pinVersion: shop.staffPinVersion }, getEnv().STAFF_COOKIE_SECRET), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/${shop.slug}/staff`,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function revokeStaffAccess(shop: Shop): Promise<void> {
  (await cookies()).delete({ name: staffCookieName(shop.id), path: `/${shop.slug}/staff` });
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}
