import Link from "next/link";
import Image from "next/image";
import { StampGrid } from "@/components/stamp-grid";
import { PerkMark } from "@/components/perk-mark";
import { SiteFooter } from "@/components/site-footer";
import { TEASER_URL } from "@/lib/site";
import "./marketing.css";

export const metadata = { title: "Perk: loyalty cards that live in the wallet" };

export default function MarketingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <PerkMark className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold tracking-tight">Perk</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">Sign in</Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:pt-20">
          <div className="min-w-0">
            <h1 className="max-w-[14ch] text-5xl font-semibold leading-[1.02] tracking-tight [overflow-wrap:anywhere] md:text-7xl">Loyalty cards that live in the wallet.</h1>
            <p className="mt-6 max-w-prose text-lg text-ink-soft">Perk replaces the paper stamp card with one your customers add to Apple Wallet or Google Wallet in a single tap. You get a URL, a poster, and a scanner. They get a card they can&rsquo;t lose.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-base font-medium text-cream hover:bg-black">Set up your shop</Link>
              <a href="#how" className="text-sm font-medium text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">See how it works</a>
            </div>
            <ul className="mt-7 flex flex-wrap gap-2 text-sm font-medium text-ink-soft">
              {["Free for coffee shops", "No app for customers", "No hardware, any phone works", "Set up in 2 minutes"].map((t) => (
                <li key={t} className="rounded-full border border-line bg-paper px-3.5 py-1.5">{t}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-start md:justify-end">
            <PassVisual stamps={7} total={10} name="Your café" reward="Free coffee of your choice" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <a href={TEASER_URL} target="_blank" rel="noreferrer" className="mk-teaser group block overflow-hidden rounded-3xl border border-line bg-paper">
            <span className="relative block aspect-video">
              <Image src="/media/teaser-thumb.webp" alt="Fifty-second video showing a card being added to a wallet and stamped at the counter" fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
              <span aria-hidden className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-cream text-ink shadow-[0_8px_24px_rgba(18,18,18,0.45)] transition-transform group-hover:scale-105 md:h-20 md:w-20">
                  <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 md:h-8 md:w-8" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
                </span>
              </span>
            </span>
            <span className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-4">
              <span className="text-sm font-medium text-ink">Watch Perk work, end to end</span>
              <span className="text-sm text-ink-muted">50 seconds &middot; opens on YouTube</span>
            </span>
          </a>
        </section>

        <div id="how" className="mx-auto w-full max-w-6xl px-5">
          <Stage n="01" label="Set up" title="Two minutes, one email." body="Sign in with a magic link, name your shop, pick a colour and how many stamps earn the reward. Perk gives you a URL for your shop and a staff PIN.">
            <SetupVisual />
          </Stage>
          <Stage n="02" label="Print" title="One poster on the counter." body="Print the A4 sheet from your dashboard. Customers scan it, tap once, and the card lands in their wallet. No app, no account, no form.">
            <PosterVisual />
          </Stage>
          <Stage n="03" label="Stamp" title="Scan, or let them scan." body="Fast enough for the morning rush: baristas scan the pass with any phone and tap +1. No terminal, no extra hardware. Or go self-serve: customers scan a counter QR after buying, with a cooldown so nobody stamps twice. Either way the pass updates on their phone within seconds.">
            <ScanVisual />
          </Stage>
          <Stage n="04" label="Redeem" title="Rewards stack until they're used." body="At ten stamps the card resets and a reward is banked. Staff redeem it with a tap; the ledger records who stamped what, and you can fix a missed stamp from the dashboard." last>
            <RedeemVisual />
          </Stage>
        </div>

        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">What&rsquo;s in the box</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            <Spec term="Apple Wallet &amp; Google Wallet" desc="Real passes, not screenshots. Stamp counts push to the phone; a web card covers everyone else." />
            <Spec term="Two stamping modes" desc="Staff-scan for control, customer-scan for speed. Switch any time in Settings." />
            <Spec term="Anonymous by default" desc="Customers never sign up. They can add an email later to back their card up." />
            <Spec term="A ledger, not a counter" desc="Every stamp, reward and adjustment is an event with a source and a timestamp." />
            <Spec term="Your brand on the card" desc="Logo and colour on the pass and the posters. Your URL is perk.app/your-shop." />
            <Spec term="Staff access without accounts" desc="A six-digit PIN opens the scanner on any phone. Refresh it and every device signs out." />
          </dl>
        </section>

        <section className="border-t border-line bg-surface-muted">
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">What your shop actually gets</h2>
            <p className="mt-3 max-w-prose text-ink-soft">Real screens from a running shop. Nothing here is a mock-up.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <PhoneShot src="/media/shop-landing.webp" caption="The page your customers land on" />
              <PhoneShot src="/media/web-card.webp" caption="The card, once it is in their wallet" />
              <PhoneShot src="/media/staff-scanner.webp" caption="What a barista sees mid-rush" />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:items-start">
              <Shot src="/media/dashboard.webp" w={1280} h={800} caption="Your dashboard: counters, customers, ledger" sizes="(max-width: 640px) 100vw, 720px" />
              <Shot src="/media/print-poster.webp" w={1280} h={1851} caption="The A4 poster, ready to print" sizes="(max-width: 640px) 100vw, 380px" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-20" id="pricing">
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Pricing</h2>
              <p className="mt-3 max-w-prose text-ink-soft">Perk was built for a real caf&eacute;, and it&rsquo;s free for yours too. If enough shops use it, it stays free and keeps growing.</p>
            </div>
            <div className="rounded-3xl border border-line bg-paper p-8">
              <div className="flex items-baseline justify-between">
                <p className="text-5xl font-semibold tracking-tight">Free</p>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">No card details asked</span>
              </div>
              <ul className="mt-6 grid gap-3 text-ink-soft sm:grid-cols-2">
                {["Unlimited customers and stamps", "Apple Wallet, Google Wallet + web card", "Both stamping modes", "Printable counter posters", "Dashboard, ledger and staff PINs", "Your logo and colours on the card"].map((t) => (
                  <li key={t} className="flex gap-2.5"><span aria-hidden className="mt-1 h-4 w-4 shrink-0 rounded-full bg-accent" /> {t}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-base font-medium text-cream hover:bg-black">Set up your shop</Link>
            </div>
          </div>
        </section>

        <section className="border-t border-line" id="faq">
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Questions cafés ask us</h2>
            <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
              <Faq q="Do my customers need to install an app?" a="No. They scan your poster and tap once, and the card goes straight into Apple Wallet or Google Wallet. Anyone without a wallet gets a web card that works the same way." />
              <Faq q="Do I need a scanner or any hardware?" a="No. Any phone works. Staff open your private staff page, point the camera at the customer's pass, and tap +1. There's a typed code fallback if the camera's busy." />
              <Faq q="Is it fast enough for the morning rush?" a="Scan, tap, done. A stamp takes about two seconds. If even that's too much, switch to self-serve mode: customers scan a counter QR themselves after buying." />
              <Faq q="What stops people stamping themselves ten times?" a="In staff mode, only your team can stamp. In self-serve mode there's a per-card cooldown you control, and every stamp lands in a ledger so you can spot and fix anything odd." />
              <Faq q="What if a customer loses their phone or deletes the pass?" a="Cards can be backed up with an email, and one tap re-sends the link. And you can fix any card's stamps from the dashboard, with a note, any time." />
              <Faq q="Is it really free?" a="Yes. Perk was built for a real caf&eacute; in New Zealand and it costs us little to run. If enough shops use it, it stays free and keeps growing." />
            </dl>
            <p className="mt-10 text-ink-soft">Question before you set up? Email <a className="font-medium text-accent-strong underline" href="mailto:hello@junadesign.co.nz">hello@junadesign.co.nz</a>. Or just <Link href="/login" className="font-medium text-accent-strong underline">try it</Link>; setup takes two minutes.</p>
          </div>
        </section>

        <section className="border-t border-line bg-accent-soft/40">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Your regulars, recognised.</h2>
              <p className="mt-2 max-w-prose text-ink-soft">Print one poster today and the next coffee you pour can come with a stamp they&rsquo;ll never lose.</p>
            </div>
            <Link href="/login" className="inline-flex h-12 shrink-0 items-center rounded-full bg-ink px-6 text-base font-medium text-cream hover:bg-black">Set up your shop &rarr;</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Shot({ src, w, h, caption, sizes }: { src: string; w: number; h: number; caption: string; sizes: string }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        <Image src={src} alt={caption} width={w} height={h} sizes={sizes} className="h-auto w-full" />
      </div>
      <figcaption className="mt-3 text-sm text-ink-soft">{caption}</figcaption>
    </figure>
  );
}

/** Phone captures vary in height; a fixed portrait crop keeps the row even. */
function PhoneShot({ src, caption }: { src: string; caption: string }) {
  return (
    <figure>
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-line bg-paper">
        <Image src={src} alt={caption} fill sizes="(max-width: 640px) 100vw, 340px" className="object-cover object-top" />
      </div>
      <figcaption className="mt-3 text-sm text-ink-soft">{caption}</figcaption>
    </figure>
  );
}

function Stage({ n, label, title, body, children, last = false }: { n: string; label: string; title: string; body: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={`mk-stage grid gap-8 py-14 md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)_minmax(0,4fr)] md:gap-10 md:py-20 ${last ? "" : ""}`}>
      <div className="">
        <p className="text-sm font-medium text-ink-muted">{n} &middot; <span className="text-accent-strong">{label}</span></p>
      </div>
      <div className="mk-reveal min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-prose text-ink-soft">{body}</p>
      </div>
      <div className="mk-reveal flex min-w-0 md:justify-end">{children}</div>
    </section>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-t border-line pt-5">
      <dt className="text-lg font-semibold">{q}</dt>
      <dd className="mt-2 max-w-prose text-ink-soft" dangerouslySetInnerHTML={{ __html: a }} />
    </div>
  );
}

function Spec({ term, desc }: { term: string; desc: string }) {
  return (
    <div className="border-t border-line pt-4">
      <dt className="font-semibold" dangerouslySetInnerHTML={{ __html: term }} />
      <dd className="mt-1 text-ink-soft">{desc}</dd>
    </div>
  );
}

function PassVisual({ stamps, total, name, reward }: { stamps: number; total: number; name: string; reward: string }) {
  return (
    <figure className="mk-phone" aria-label={`Example wallet pass with ${stamps} of ${total} stamps`}>
      <div className="mk-pass">
        <div className="flex items-center justify-between text-xs opacity-90"><span>{name}</span><span>Perk</span></div>
        <p className="mt-5 text-[11px] uppercase tracking-wide opacity-80">Stamps</p>
        <p className="text-3xl font-semibold leading-none">{stamps} <span className="text-base opacity-80">/ {total}</span></p>
        <div className="mt-4 rounded-xl bg-white p-3 text-ink"><StampGrid stamps={stamps} total={total} color="var(--accent)" size="sm" /></div>
        <p className="mt-3 text-[11px] uppercase tracking-wide opacity-80">Reward</p>
        <p className="text-sm font-medium">{reward}</p>
        <div className="mt-4 flex justify-center rounded-lg bg-white p-2"><span className="grid h-14 w-14 grid-cols-6 gap-px" aria-hidden>{Array.from({ length: 36 }, (_, i) => <span key={i} className={i % 3 === 0 || i % 7 === 0 ? "bg-ink" : "bg-white"} />)}</span></div>
      </div>
    </figure>
  );
}

function SetupVisual() {
  return (
    <figure className="w-full max-w-xs rounded-card border border-line bg-paper p-5" aria-label="Setup form preview">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your URL</p>
      <p className="mt-1 font-mono text-sm">perk.app/<span className="rounded bg-accent-soft px-1 text-accent-strong">your-shop</span></p>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-muted">Stamps to earn a reward</p>
      <div className="mt-2 h-2 rounded-full bg-line"><div className="h-2 w-1/3 rounded-full bg-accent" /></div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-muted">Staff PIN</p>
      <p className="mt-1 font-mono text-2xl tracking-[0.3em]">••••••</p>
    </figure>
  );
}

function PosterVisual() {
  return (
    <figure className="w-56 rounded-2xl bg-accent p-5 text-center text-accent-ink" aria-label="Counter poster preview">
      <p className="text-lg font-semibold leading-tight">Get a free coffee card</p>
      <p className="mt-1 text-xs opacity-90">Collect 10 stamps</p>
      <div className="mx-auto mt-4 grid h-24 w-24 grid-cols-8 gap-px rounded-lg bg-white p-2" aria-hidden>{Array.from({ length: 64 }, (_, i) => <span key={i} className={(i * 7) % 5 < 2 ? "bg-ink" : "bg-white"} />)}</div>
      <p className="mt-3 text-[11px] opacity-90">Scan to add to Apple or Google Wallet</p>
    </figure>
  );
}

function ScanVisual() {
  return (
    <figure className="w-full max-w-xs rounded-card border border-line bg-paper p-5" aria-label="Staff scanner preview">
      <div className="flex items-center justify-between"><p className="font-mono tracking-[0.2em]">ABCD-2345</p><p className="text-2xl font-semibold">6<span className="text-sm text-ink-muted"> / 10</span></p></div>
      <div className="mt-3"><StampGrid stamps={6} total={10} color="var(--accent)" size="sm" /></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><span className="inline-flex h-10 items-center justify-center rounded-full bg-ink text-sm font-medium text-cream">+1 stamp</span><span className="inline-flex h-10 items-center justify-center rounded-full border border-line text-sm font-medium text-ink-muted">Redeem</span></div>
    </figure>
  );
}

function RedeemVisual() {
  return (
    <figure className="w-full max-w-xs rounded-card border border-line bg-paper p-0" aria-label="Activity ledger preview">
      <ul className="divide-y divide-line text-sm">
        {[["Redeemed", "ABCD-2345", "Staff"], ["Reward earned", "ABCD-2345", "Staff"], ["Stamp", "ABCD-2345", "Staff"], ["Adjusted +1", "QRST-7890", "Owner"]].map(([t, c, s]) => (
          <li key={t + c} className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="font-medium">{t}</span><span className="font-mono text-ink-soft">{c}</span><span className="text-ink-muted">{s}</span></li>
        ))}
      </ul>
    </figure>
  );
}
