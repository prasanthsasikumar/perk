import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getShopBySlug, publicShop } from "@/lib/db/queries/shops";
import { getCard } from "@/lib/db/queries/cards";
import { readCardCookie } from "@/lib/cookies/card-cookie";
import { detectPlatform } from "@/lib/ua";
import { StampGrid } from "@/components/stamp-grid";
import { Qr } from "@/components/qr";
import { WalletButtons } from "@/components/wallet-buttons";
import { Badge } from "@/components/ui/badge";
import { ShopHeader } from "../../shop-header";
import { issueApple, issueGoogle } from "../../actions";
import { BackupForm, ClaimCookie } from "./client";

export async function generateMetadata({ params }: PageProps<"/[slug]/card/[cardId]">) {
  const { slug, cardId } = await params;
  return { manifest: `/${slug}/card/${cardId}/manifest.webmanifest`, robots: { index: false, follow: false } };
}

export default async function WebCardPage({ params, searchParams }: PageProps<"/[slug]/card/[cardId]">) {
  const { slug, cardId } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  const card = await getCard(db, shop.id, cardId);
  if (!card) notFound();
  const pub = publicShop(shop);
  const platform = detectPlatform((await headers()).get("user-agent"));
  const hasCookie = (await readCardCookie(shop.id)) === card.id;
  const walletNotice = sp.wallet === "google-unavailable" ? "Google Wallet isn't available for this shop yet — your web card works the same way." : sp.wallet === "google-error" ? "Couldn't open Google Wallet right now. Your web card still works." : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
      {!hasCookie && <ClaimCookie slug={slug} cardId={card.id} />}
      <ShopHeader shop={pub} subtitle="Your stamp card" />

      <section className="mt-6 rounded-3xl p-6 text-white shadow-xl" style={{ background: shop.brandColor }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90">Stamps</p>
            <p className="text-3xl font-semibold leading-none">{card.stamps} <span className="text-lg opacity-80">/ {shop.stampsRequired}</span></p>
          </div>
          {card.rewardsAvailable > 0 && (
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold" style={{ color: shop.brandColor }}>
              {card.rewardsAvailable} reward{card.rewardsAvailable > 1 ? "s" : ""} ready 🎉
            </span>
          )}
        </div>
        <div className="mt-5 rounded-2xl bg-white p-4 text-ink">
          <StampGrid stamps={card.stamps} total={shop.stampsRequired} color={shop.brandColor} />
          <p className="mt-3 text-sm text-ink-soft">Reward: {shop.rewardText}</p>
        </div>
      </section>

      <section className="mt-6 flex flex-col items-center rounded-3xl border border-line bg-paper p-6 text-center">
        <p className="text-sm text-ink-soft">Show this at the counter</p>
        <div className="mt-3"><Qr value={card.id} size={180} label="Your card QR code" /></div>
        <p className="mt-3 font-mono text-lg tracking-[0.2em]" data-testid="short-code">{card.shortCode.slice(0, 4)}-{card.shortCode.slice(4)}</p>
        <p className="text-xs text-ink-muted">Card code, if the scanner isn&rsquo;t handy</p>
      </section>

      {walletNotice && <p className="mt-4 text-sm text-ink-soft">{walletNotice}</p>}

      <section className="mt-6 space-y-3">
        <p className="text-sm font-medium text-ink-soft">Keep it in your wallet</p>
        <WalletButtons platform={platform} onApple={issueApple.bind(null, slug, undefined, undefined)} onGoogle={issueGoogle.bind(null, slug, undefined, undefined)} compact />
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium">Back up this card</p>
          {card.email && <Badge tone="ok">Saved</Badge>}
        </div>
        <p className="mt-1 text-sm text-ink-soft">{card.email ? `We'll send the link to ${card.email} again if you need it.` : "Get a link by email so you can find your card if you lose this page."}</p>
        <div className="mt-3"><BackupForm slug={slug} cardId={card.id} defaultEmail={card.email ?? ""} /></div>
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-ink-muted">
        <Link href={`/${slug}`} className="underline">{shop.name}</Link> · Powered by <Link href="/" className="underline">Perk</Link>
      </footer>
    </main>
  );
}
