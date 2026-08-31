import { db } from "@/lib/db/client";
import { getCardByIdAny } from "@/lib/db/queries/cards";
import { buildApplePass } from "@/lib/wallet/apple";
import { getEnv } from "@/lib/env";

/** Public download of a card's Apple Wallet pass. The card id is the bearer credential. */
export async function GET(_req: Request, ctx: RouteContext<"/api/cards/[id]/apple-pass">) {
  const { id } = await ctx.params;
  const found = await getCardByIdAny(db, id);
  if (!found) return new Response("Not found", { status: 404 });
  const buffer = await buildApplePass(found.shop, found.card);
  const dry = getEnv().WALLET_DRY_RUN_BOOL;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": dry ? "application/json" : "application/vnd.apple.pkpass",
      "content-disposition": dry ? "inline" : `attachment; filename="${found.shop.slug}.pkpass"`,
      "cache-control": "no-store",
    },
  });
}
