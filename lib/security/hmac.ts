import { createHmac, timingSafeEqual } from "node:crypto";
import type { Shop } from "@/lib/db/schema";

function hmac(secret: string, message: string): Buffer {
  return createHmac("sha256", secret).update(message).digest();
}

/** Token embedded in a shop's printed "scan to stamp" QR. */
export function signScanToken(qrSecret: string, slug: string): string {
  return hmac(qrSecret, `scan:${slug}`).toString("base64url");
}

export function verifyScanToken(qrSecret: string, slug: string, token: string): boolean {
  if (typeof token !== "string" || token.length === 0) return false;
  let given: Buffer;
  try {
    given = Buffer.from(token, "base64url");
  } catch {
    return false;
  }
  const expected = hmac(qrSecret, `scan:${slug}`);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}

export function buildScanUrl(appUrl: string, shop: Pick<Shop, "slug" | "qrSecret">): string {
  return `${appUrl}/${shop.slug}/scan?t=${signScanToken(shop.qrSecret, shop.slug)}`;
}
