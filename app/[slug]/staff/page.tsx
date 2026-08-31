import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getShopBySlug, publicShop } from "@/lib/db/queries/shops";
import { hasStaffAccess } from "@/lib/staff/auth";
import { ShopHeader } from "../shop-header";
import { PinForm } from "./pin-form";
import { Scanner } from "./scanner";

export const metadata = { title: "Staff", robots: { index: false } };

export default async function StaffPage({ params }: PageProps<"/[slug]/staff">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  const ok = await hasStaffAccess(shop);
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6">
      <ShopHeader shop={publicShop(shop)} subtitle="Staff · stamp & redeem" />
      <div className="mt-6 flex-1">{ok ? <Scanner slug={slug} brandColor={shop.brandColor} /> : <PinForm slug={slug} />}</div>
    </main>
  );
}
