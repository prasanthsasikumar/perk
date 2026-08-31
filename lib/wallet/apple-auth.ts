import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db/client";
import { getCardByIdAny } from "@/lib/db/queries/cards";

/** Resolve the card for a PassKit web-service request, verifying `Authorization: ApplePass <token>`. */
export async function authenticatePassRequest(req: Request, serial: string) {
  const header = req.headers.get("authorization") ?? "";
  const m = /^ApplePass\s+(\S+)$/i.exec(header);
  if (!m) return null;
  const found = await getCardByIdAny(db, serial);
  if (!found) return null;
  const a = Buffer.from(m[1]);
  const b = Buffer.from(found.card.appleAuthToken);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return found;
}
