import { authenticatePassRequest } from "@/lib/wallet/apple-auth";
import { buildApplePass } from "@/lib/wallet/apple";

/** Latest version of a pass. */
export async function GET(req: Request, ctx: RouteContext<"/api/wallet/apple/v1/passes/[passTypeId]/[serial]">) {
  const { serial } = await ctx.params;
  const found = await authenticatePassRequest(req, serial);
  if (!found) return new Response(null, { status: 401 });
  const ims = req.headers.get("if-modified-since");
  const updated = found.card.updatedAt;
  if (ims) {
    const t = new Date(ims).getTime();
    if (!Number.isNaN(t) && Math.floor(updated.getTime() / 1000) <= Math.floor(t / 1000)) return new Response(null, { status: 304 });
  }
  const buffer = await buildApplePass(found.shop, found.card);
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: { "content-type": "application/vnd.apple.pkpass", "last-modified": updated.toUTCString(), "cache-control": "no-store" },
  });
}
