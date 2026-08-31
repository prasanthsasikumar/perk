import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { getShopBySlug, publicShop } from "@/lib/db/queries/shops";
import { getCard } from "@/lib/db/queries/cards";
import { stampCard } from "@/lib/domain/cards";
import { CooldownActive, isDomainError } from "@/lib/domain/errors";
import { verifyScanToken } from "@/lib/security/hmac";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { readCardCookie } from "@/lib/cookies/card-cookie";
import { scheduleWalletUpdate } from "@/lib/wallet";
import { StampGrid } from "@/components/stamp-grid";
import { ShopHeader } from "../shop-header";
import { buttonClass } from "@/components/ui/button";

export const metadata = { title: "Stamp", robots: { index: false } };

function Shell({ shop, children }: { shop: ReturnType<typeof publicShop>; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
      <ShopHeader shop={shop} subtitle="Stamp your card" />
      <div className="mt-8 flex-1">{children}</div>
    </main>
  );
}

export default async function ScanPage({ params, searchParams }: PageProps<"/[slug]/scan">) {
  const { slug } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(db, slug);
  if (!shop) notFound();
  const pub = publicShop(shop);
  const token = typeof sp.t === "string" ? sp.t : "";

  if (!verifyScanToken(shop.qrSecret, shop.slug, token)) {
    return <Shell shop={pub}><Notice title="This QR code is no longer valid" body="Ask the barista for the current one." /></Shell>;
  }
  if (shop.stampMode !== "customer") {
    return (
      <Shell shop={pub}>
        <Notice title="Ask the barista to stamp your card" body={`${shop.name} stamps cards at the counter — just show your pass.`}>
          <Link href={`/${slug}`} className={buttonClass("primary", "lg")}>Open my card</Link>
        </Notice>
      </Shell>
    );
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  const rl = await checkRateLimit(db, `scan:${ip}`, 20, 60 * 60_000);
  if (!rl.allowed) return <Shell shop={pub}><Notice title="Too many scans" body="Please try again a little later." /></Shell>;

  // Card comes from the cookie, or from the ?card= param right after creation (cookie set in the same action).
  const cookieCard = await readCardCookie(shop.id);
  const paramCard = typeof sp.card === "string" ? sp.card : null;
  const cardId = cookieCard ?? paramCard;
  const card = cardId ? await getCard(db, shop.id, cardId) : null;

  if (!card) {
    return (
      <Shell shop={pub}>
        <Notice title="Get your card first" body="It takes one tap — then this QR stamps it every visit.">
          <Link href={`/${slug}?then=scan&t=${encodeURIComponent(token)}`} className={buttonClass("primary", "lg")}>Get my card</Link>
        </Notice>
      </Shell>
    );
  }

  type Outcome = { kind: "ok"; stamps: number; rewardsAvailable: number; rewardEarned: boolean } | { kind: "cooldown"; retryAt: Date } | { kind: "error"; message: string };
  let outcome: Outcome;
  try {
    const r = await stampCard(db, shop.id, card.id, { source: "customer_scan" });
    scheduleWalletUpdate(shop, r.card);
    outcome = { kind: "ok", stamps: r.card.stamps, rewardsAvailable: r.card.rewardsAvailable, rewardEarned: Boolean(r.rewardEarned) };
  } catch (e) {
    if (e instanceof CooldownActive) outcome = { kind: "cooldown", retryAt: e.retryAt };
    else if (isDomainError(e)) outcome = { kind: "error", message: e.message };
    else throw e;
  }

  if (outcome.kind === "cooldown") {
    const when = outcome.retryAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <Shell shop={pub}>
        <Notice title="Already stamped" body={`Your card was stamped recently. You can stamp again after ${when}.`}>
          <Link href={`/${slug}/card/${card.id}`} className={buttonClass("secondary", "lg")}>Open my card</Link>
        </Notice>
      </Shell>
    );
  }
  if (outcome.kind === "error") return <Shell shop={pub}><Notice title="Something went wrong" body={outcome.message} /></Shell>;

  return (
    <Shell shop={pub}>
      <section className="rounded-3xl p-6 text-white shadow-xl" style={{ background: shop.brandColor }}>
        <p className="text-sm opacity-90">{outcome.rewardEarned ? "You did it!" : "Stamped!"}</p>
        <p className="mt-1 text-2xl font-semibold leading-tight">{outcome.rewardEarned ? `Reward unlocked: ${shop.rewardText}` : `${outcome.stamps} of ${shop.stampsRequired} stamps`}</p>
        <div className="mt-5 rounded-2xl bg-white p-4 text-ink">
          <StampGrid stamps={outcome.stamps} total={shop.stampsRequired} color={shop.brandColor} />
          {outcome.rewardsAvailable > 0 && <p className="mt-3 text-sm font-medium" style={{ color: shop.brandColor }}>{outcome.rewardsAvailable} reward{outcome.rewardsAvailable > 1 ? "s" : ""} ready — show the barista to redeem.</p>}
        </div>
      </section>
      <div className="mt-6 text-center">
        <Link href={`/${slug}/card/${card.id}`} className={buttonClass("secondary", "lg")}>Open my card</Link>
      </div>
    </Shell>
  );
}

function Notice({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-6 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-ink-soft">{body}</p>
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}
