import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getShopBySlug } from "@/lib/db/queries/shops";

export async function generateMetadata({ params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) return {};
  return { title: `${shop.name} stamp card`, description: `Collect ${shop.stampsRequired} stamps at ${shop.name} to earn: ${shop.rewardText}.`, themeColor: shop.brandColor };
}

export default async function ShopLayout({ children, params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  return (
    <div className="flex flex-1 flex-col" style={{ ["--brand" as string]: shop.brandColor }}>
      {children}
    </div>
  );
}
