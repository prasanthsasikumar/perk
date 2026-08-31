import { cookies } from "next/headers";

export function cardCookieName(shopId: string): string {
  return `perk_card_${shopId}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function readCardCookie(shopId: string): Promise<string | null> {
  const v = (await cookies()).get(cardCookieName(shopId))?.value;
  return v && UUID_RE.test(v) ? v : null;
}

/** Only callable from server actions / route handlers (Next.js restriction). */
export async function setCardCookie(shopId: string, cardId: string): Promise<void> {
  (await cookies()).set(cardCookieName(shopId), cardId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
