import { notFound } from "next/navigation";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { db } from "@/lib/db/client";
import { getShopBySlug } from "@/lib/db/queries/shops";
import { describeTiers } from "@/lib/domain/tiers";

const instrumentSans = Instrument_Sans({ variable: "--font-instrument-sans", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400" });

export async function generateMetadata({ params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) return {};
  return { title: `${shop.name} stamp card`, description: `Collect stamps at ${shop.name}. ${describeTiers(shop)}.` };
}

export async function generateViewport({ params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  return { themeColor: shop?.brandColor ?? "#F6F4F0", width: "device-width", initialScale: 1 };
}

/** Customer-facing shop pages: warm off-white page, Instrument Sans, brand colour as a CSS variable. */
export default async function ShopLayout({ children, params }: LayoutProps<"/[slug]">) {
  const { slug } = await params;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  return (
    <div
      className={`${instrumentSans.variable} ${instrumentSerif.variable} flex flex-1 flex-col bg-[#F6F4F0] text-[#1A1720] antialiased [font-family:var(--font-instrument-sans),Helvetica,Arial,sans-serif]`}
      style={{ ["--brand" as string]: shop.brandColor }}
    >
      {children}
    </div>
  );
}
