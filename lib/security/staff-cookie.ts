import { createHmac, timingSafeEqual } from "node:crypto";

export type StaffCookiePayload = { shopId: string; pinVersion: number };

export function staffCookieName(shopId: string): string {
  return `perk_staff_${shopId}`;
}

function sig(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function signStaffCookie(payload: StaffCookiePayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sig(secret, body)}`;
}

export function verifyStaffCookie(value: string | undefined, secret: string): StaffCookiePayload | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = value.slice(0, dot);
  const given = value.slice(dot + 1);
  const expected = sig(secret, body);
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof parsed?.shopId !== "string" || typeof parsed?.pinVersion !== "number") return null;
    return { shopId: parsed.shopId, pinVersion: parsed.pinVersion };
  } catch {
    return null;
  }
}
