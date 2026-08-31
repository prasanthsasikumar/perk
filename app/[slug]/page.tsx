import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getShopBySlug, publicShop } from "@/lib/db/queries/shops";
import { getCard } from "@/lib/db/queries/cards";
import { readCardCookie } from "@/lib/cookies/card-cookie";
import { detectPlatform } from "@/lib/ua";
import { StampGrid } from "@/components/stamp-grid";
import { WalletButtons } from "@/components/wallet-buttons";
import { ShopHeader } from "./shop-header";
import { issueApple, issueGoogle, issueWeb } from "./actions";

export default async function ShopLandingPage({ params, searchParams }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  const pub = publicShop(shop);
  const platform = detectPlatform((await headers()).get("user-agent"));
  const then = typeof sp.then === "string" ? sp.then : undefined;
  const token = typeof sp.t === "string" ? sp.t : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const cookieCard = await readCardCookie(shop.id);
  const existing = cookieCard ? await getCard(db, shop.id, cookieCard) : null;

  const onApple = issueApple.bind(null, slug, then, token);
  const onGoogle = issueGoogle.bind(null, slug, then, token);
  const onWeb = issueWeb.bind(null, slug, then, token);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
      <ShopHeader shop={pub} subtitle="Loyalty card" />

      <section className="mt-8 rounded-3xl p-6 text-white shadow-xl" style={{ background: shop.brandColor }}>
        <p className="text-sm/5 opacity-90">Collect {shop.stampsRequired} stamps and get</p>
        <p className="mt-1 text-2xl font-semibold leading-tight">{shop.rewardText}</p>
        <div className="mt-6 rounded-2xl bg-white p-4 text-ink">
          <StampGrid stamps={existing?.stamps ?? 0} total={shop.stampsRequired} color={shop.brandColor} size="sm" />
          <p className="mt-3 text-xs text-ink-soft">
            {existing ? `${existing.stamps} / ${shop.stampsRequired} stamps` : "Your card starts empty — first stamp with your next coffee."}
          </p>
        </div>
      </section>

      {error === "rate_limited" && <p className="mt-4 text-sm text-danger">Too many new cards from this network. Try again later.</p>}

      <section className="mt-8 space-y-4">
        {existing ? (
          <>
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="text-ink-soft">You already have a card here. Open it, or add it to your wallet.</p>
            <Link href={`/${slug}/card/${existing.id}`} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-cream">Open my card</Link>
            <WalletButtons platform={platform} onApple={onApple} onGoogle={onGoogle} compact />
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Add your card in one tap</h1>
            <p className="text-ink-soft">No sign-up. It lives in your phone&rsquo;s wallet and updates every time you get a stamp.</p>
            <WalletButtons platform={platform} onApple={onApple} onGoogle={onGoogle} onWeb={onWeb} />
          </>
        )}
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-ink-muted">
        {shop.stampMode === "barista" ? "Show your card at the counter to get stamped." : "Scan the QR at the counter after each purchase to stamp your card."}
        <br />
        Powered by <Link href="/" className="underline">Perk</Link>
      </footer>
    </main>
  );
}
