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
import { bonusStampPositions, rewardTiers, statusLine } from "@/lib/domain/tiers";
import { brandGradient } from "@/lib/color";
import { getEnv } from "@/lib/env";
import { Qr } from "@/components/qr";

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

  const tiers = rewardTiers(shop);
  const bonus = tiers.slice(0, -1);
  const cookieCard = await readCardCookie(shop.id);
  const existing = cookieCard ? await getCard(db, shop.id, cookieCard) : null;
  const stamps = existing?.stamps ?? 0;

  const onApple = issueApple.bind(null, slug, then, token);
  const onGoogle = issueGoogle.bind(null, slug, then, token);
  const onWeb = issueWeb.bind(null, slug, then, token);

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-5 pb-7 pt-10">
      <ShopHeader shop={pub} subtitle="Loyalty card" />

      {/* Hero card */}
      <section className="relative mt-7 overflow-hidden rounded-[22px] px-6 pb-6 pt-[26px] text-white shadow-[0_18px_40px_-22px_rgba(26,23,32,0.7),0_2px_6px_rgba(26,23,32,0.06)]" style={{ background: brandGradient(shop.brandColor) }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-white/70">Collect {shop.stampsRequired} stamps</p>
            <p className="text-[clamp(30px,9vw,38px)] leading-[1.05] tracking-[-0.015em] [font-family:var(--font-instrument-serif),Georgia,serif] [text-wrap:balance]">{shop.rewardText}</p>
            {bonus.length > 0 && (
              <p className="pt-1 text-[12.5px] leading-snug text-white/70">Plus along the way: {bonus.map((t) => `${t.reward} at ${t.stamps} stamps`).join(", ")}</p>
            )}
          </div>
          <div className="flex-none pt-1 text-right">
            <p className="text-[26px] font-semibold leading-none tracking-[-0.02em]">{stamps}<span className="text-[17px] font-medium text-white/55">/{shop.stampsRequired}</span></p>
            <p className="pt-1 text-[11px] uppercase tracking-[0.08em] text-white/55">stamps</p>
          </div>
        </div>

        <div className="mt-[22px] rounded-2xl bg-white/[0.97] px-5 pb-4 pt-5 text-[#1A1720] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
          <StampGrid stamps={stamps} total={shop.stampsRequired} color={shop.brandColor} style={shop.stampStyle} milestones={bonusStampPositions(shop)} emptyStyle="dashed" className="justify-items-center gap-x-2.5 gap-y-3.5" />
          <p className="mt-4 border-t border-[rgba(26,23,32,0.08)] pt-3.5 text-center text-[12.5px] leading-[1.45] text-[#6E6878]">{statusLine(stamps, existing?.pendingRewards ?? [], tiers)}</p>
        </div>
      </section>

      <hr className="my-[30px] border-0 border-t border-[rgba(26,23,32,0.09)]" />

      {error === "rate_limited" && <p className="mb-4 text-sm text-danger">Too many new cards from this network. Try again later.</p>}

      {existing ? (
        <>
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[22px] font-semibold tracking-[-0.015em]">Welcome back</h1>
            <p className="text-[15px] leading-[1.55] text-[#5C5666] [text-wrap:pretty]">You already have a card here. Open it, or add it to your wallet.</p>
          </div>
          <div className="flex flex-col gap-2.5 pt-[22px]">
            <Link href={`/${slug}/card/${existing.id}`} className="flex h-[54px] items-center justify-center rounded-[14px] bg-[#121014] text-[15.5px] font-semibold text-white shadow-[0_1px_2px_rgba(26,23,32,0.18)] transition-colors hover:bg-[#2A2630]">Open my card</Link>
            <WalletButtons platform={platform} onApple={onApple} onGoogle={onGoogle} compact layout="stack" />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[22px] font-semibold tracking-[-0.015em]">Add your card in one tap</h1>
            <p className="text-[15px] leading-[1.55] text-[#5C5666] [text-wrap:pretty]">No sign-up needed. It lives in your phone&rsquo;s wallet and updates every time you get a stamp.</p>
          </div>
          <div className="pt-[22px]">
            <WalletButtons platform={platform} onApple={onApple} onGoogle={onGoogle} onWeb={onWeb} layout="stack" />
          </div>
        </>
      )}

      {platform === "other" && (
        <section className="mt-[22px] flex items-center gap-4 rounded-2xl border border-[rgba(26,23,32,0.09)] bg-white p-4">
          <Qr value={`${getEnv().NEXT_PUBLIC_APP_URL}/${slug}`} size={112} label="QR code for this page" className="flex-none !p-0" />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.01em]">On a computer?</p>
            <p className="mt-1 text-[13.5px] leading-[1.5] text-[#5C5666]">Scan this with your phone camera to add the card straight to your wallet.</p>
          </div>
        </section>
      )}

      <p className="flex items-center gap-2 pt-[18px] text-[13px] text-[#6E6878]">
        <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: shop.brandColor }} />
        {shop.stampMode === "barista" ? "Show your card at the counter to get stamped." : "Scan the QR at the counter after each purchase to stamp your card."}
      </p>

      <div className="min-h-10 flex-1" />

      <footer className="flex items-center justify-between gap-3 border-t border-[rgba(26,23,32,0.08)] pt-6 text-[12.5px] text-[#8A8493]">
        <span>Powered by <Link href="/" className="font-medium text-[#5C5666] hover:underline">Perk</Link></span>
        <span className="flex gap-3.5"><Link href="/privacy" className="hover:underline">Privacy</Link><Link href="/terms" className="hover:underline">Terms</Link></span>
      </footer>
    </main>
  );
}
