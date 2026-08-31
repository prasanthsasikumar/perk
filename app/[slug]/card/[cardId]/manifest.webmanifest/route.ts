import { db } from "@/lib/db/client";
import { getShopBySlug } from "@/lib/db/queries/shops";
import { getCard } from "@/lib/db/queries/cards";

export async function GET(_req: Request, ctx: RouteContext<"/[slug]/card/[cardId]/manifest.webmanifest">) {
  const { slug, cardId } = await ctx.params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) return new Response("Not found", { status: 404 });
  if (!(await getCard(db, shop.id, cardId))) return new Response("Not found", { status: 404 });
  const manifest = {
    name: `${shop.name} card`,
    short_name: shop.name.slice(0, 12),
    start_url: `/${slug}/card/${cardId}`,
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: shop.brandColor,
    icons: shop.logoUrl
      ? [{ src: shop.logoUrl, sizes: "512x512", type: "image/png" }]
      : [{ src: "/pass/icon@3x.png", sizes: "87x87", type: "image/png" }, { src: "/pass/logo@3x.png", sizes: "480x150", type: "image/png" }],
  };
  return new Response(JSON.stringify(manifest), { headers: { "content-type": "application/manifest+json" } });
}
