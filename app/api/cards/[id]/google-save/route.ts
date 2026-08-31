import { db } from "@/lib/db/client";
import { getCardByIdAny } from "@/lib/db/queries/cards";
import { googleWallet, isGoogleConfigured } from "@/lib/wallet/google";

/** Redirects to the Google Wallet save link for this card. */
export async function GET(_req: Request, ctx: RouteContext<"/api/cards/[id]/google-save">) {
  const { id } = await ctx.params;
  const found = await getCardByIdAny(db, id);
  if (!found) return new Response("Not found", { status: 404 });
  if (!isGoogleConfigured()) {
    return Response.redirect(new URL(`/${found.shop.slug}/card/${id}?wallet=google-unavailable`, _req.url), 302);
  }
  try {
    const art = await googleWallet.createPass(found.shop, found.card);
    if (art.kind !== "google") throw new Error("unexpected artifact");
    return Response.redirect(art.saveUrl, 302);
  } catch (e) {
    console.error("[google] save link failed", { cardId: id }, e);
    return Response.redirect(new URL(`/${found.shop.slug}/card/${id}?wallet=google-error`, _req.url), 302);
  }
}
