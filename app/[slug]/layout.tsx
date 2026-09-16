import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getShopBySlug } from "@/lib/db/queries/shops";
import { describeTiers } from "@/lib/domain/tiers";

export async function generateMetadata({ params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) return {};
  return { title: `${shop.name} stamp card`, description: `Collect stamps at ${shop.name}. ${describeTiers(shop)}.` };
}

export async function generateViewport({ params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  return { themeColor: shop?.brandColor ?? "#f9f9fb", width: "device-width", initialScale: 1 };
}

/** Customer-facing shop pages: Perk's type system on Surface Muted, with the shop's colour as a CSS variable. */
export default async function ShopLayout({ children, params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  return (
    <div
      className="flex flex-1 flex-col bg-surface-muted text-ink antialiased"
      style={{ ["--brand" as string]: shop.brandColor }}
    >
      {children}
    </div>
  );
}
