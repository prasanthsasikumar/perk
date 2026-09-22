import Link from "next/link";
import { StampGrid } from "@/components/stamp-grid";
import { PerkMark } from "@/components/perk-mark";
import { APP_HOST } from "@/lib/site";
import "./marketing.css";

export const metadata = { title: "Perk: digital loyalty cards made easy" };

/** The sign-off address the client asked for on this page; the legal pages use CONTACT_EMAIL. */
const FAQ_EMAIL = "hannah@junadesign.co.nz";

export default function MarketingPage() {
  return (
    <div className="mk flex flex-1 flex-col overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <PerkMark className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold tracking-tight">Perk</span>
        </Link>
        <Link href="/login" className="text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">Sign in</Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:pt-24">
          <div className="min-w-0">
            <h1 className="max-w-[16ch] text-5xl font-semibold leading-[1.04] tracking-tight [overflow-wrap:anywhere] md:text-6xl">Digital loyalty cards made easy.</h1>
            <p className="mt-6 max-w-prose text-lg text-ink-soft">Create digital loyalty cards for customers to add to their Apple Wallet or Google Wallet. No app download required.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/login" className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-base font-medium text-cream transition-colors hover:bg-black">Set up your shop</Link>
              <a href="#how" className="text-sm font-medium text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink">See how it works</a>
            </div>
          </div>
          <div className="flex justify-start md:justify-end">
            <PassVisual stamps={7} total={10} name="Your café" reward="Free coffee of your choice" code="ABCD-2345" />
          </div>
        </section>

        <div id="how" className="mx-auto w-full max-w-6xl px-5">
          <Stage n="01" label="Set up" title="Set up in 2 minutes." body="Name your shop, pick a colour and how many stamps earn the reward. Perk gives you a URL for your shop and a staff PIN to scan customers' cards.">
            <SetupVisual />
          </Stage>
          <Stage
            n="02"
            label="Print"
            title="One poster on the counter."
            body="Print the provided A4 poster from your dashboard. Customers scan it and the card lands in their Apple or Google Wallet — no app download or account required."
            more="No Apple or Google Wallet? Customers can also get a card emailed as a web link."
          >
            <PosterVisual />
          </Stage>
          <Stage n="03" label="Stamp" title="Scan, or let them scan." body="Scan your customer's pass with any device and tap +1 stamp. Alternatively, let customers scan a counter QR after their purchase, with a cool down so nobody stamps twice. Either way, their pass updates on their phone within seconds.">
            <ScanVisual />
          </Stage>
          <Stage n="04" label="Redeem" title="Rewards stack until they're used." body="At your chosen limit the card resets and a reward is banked. Staff redeem it with a tap; your online dashboard records who stamped what, and you can fix a missed stamp any time.">
            <RedeemVisual />
          </Stage>
        </div>

        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">What&rsquo;s in the box</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            <Spec term={<>Apple Wallet &amp; Google Wallet</>} desc="Customers scan your QR code to add a card to their digital mobile wallet, or get a card emailed as a web link." />
            <Spec term="Two stamping modes" desc="Staff-scan for control, customer-scan for speed. Switch any time in Settings." />
            <Spec term="Anonymous by default" desc="No sign up or app downloads for customers. They can add an email later to back their card up." />
            <Spec term="A dashboard, not a counter" desc="Every stamp, reward and adjustment is recorded with a timestamp. Track recent activity and redemptions in your dashboard." />
            <Spec term="Your brand on the card" desc={`Logo and colour on the pass and the posters. Your URL is ${APP_HOST}/your-shop.`} />
            <Spec term="Staff access without accounts" desc="A six-digit PIN opens the scanner on any phone. Refresh the PIN and every device signs out." />
          </dl>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-20" id="pricing">
          <div className="grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:items-start">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Pricing</h2>
              <p className="mt-3 max-w-prose text-ink-soft">Perk was built for a real caf&eacute; &mdash; and it&rsquo;s currently free during our trial launch period.</p>
            </div>
            <div className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-5xl font-semibold tracking-tight">Free</p>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">No card details asked</span>
              </div>
              <ul className="mt-6 grid gap-3 text-ink-soft sm:grid-cols-2 sm:gap-x-8">
                {[
                  "Apple Wallet, Google Wallet, and web card options",
                  "Staff-scan and customer-scan modes",
                  "Unlimited customers and stamps",
                  "Printable counter posters",
                  "Dashboard and staff PINs",
                  "Your logo and colours on the card",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5"><span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />{t}</li>
                ))}
              </ul>
              <Link href="/login" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-base font-medium text-cream transition-colors hover:bg-black">Set up your shop</Link>
            </div>
          </div>
        </section>

        <section className="border-t border-line" id="faq">
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
            <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
              <Faq q="Do my customers need to install an app?" a="No. They scan your poster and the card goes straight into Apple Wallet or Google Wallet. Anyone without a wallet gets a web card (URL) that works the same way." />
              <Faq q="Do I need a scanner or any hardware?" a="No. Any phone or device with a camera works. Staff will access your private staff page with a PIN, point the camera at the customer's pass, and tap +1. There's a typed code fallback if the camera's unavailable." />
              <Faq q="How long does it take to stamp?" a="Have the staff page ready, then scan, tap, done — a stamp takes about two seconds. If even that's too much, switch to self-serve mode: customers scan a counter QR themselves after buying." />
              <Faq q="What stops people stamping themselves ten times?" a="In staff mode, only your team can stamp. In self-serve mode there's a per-card cool down you control, and every stamp lands in a dashboard so you can spot and fix anything odd." />
              <Faq q="What if a customer loses their phone or deletes the pass?" a="Cards can be backed up with an email — one tap re-sends the link. And you can fix any card's stamps from the dashboard, with a note, any time." />
              <Faq q="Why use digital loyalty cards?" a="Digital loyalty cards never get lost, making it easier for customers to return. For your business, reward updates happen in seconds, and every scan and redemption is tracked in your dashboard." />
            </dl>
            <p className="mt-10 text-ink-soft">
              Question before you set up? Email <a className="font-medium text-accent-strong underline underline-offset-4" href={`mailto:${FAQ_EMAIL}`}>{FAQ_EMAIL}</a> &mdash; or just <Link href="/login" className="font-medium text-accent-strong underline underline-offset-4">try it</Link>; setup takes two minutes.
            </p>
          </div>
        </section>
      </main>

      <footer className="no-print border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-8 text-sm text-ink-muted">
          <p>Perk &middot; digital loyalty cards</p>
          <nav className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
            <Link href="/login" className="transition-colors hover:text-ink">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Stage({ n, label, title, body, more, children }: { n: string; label: string; title: string; body: string; more?: string; children: React.ReactNode }) {
  return (
    <section className="mk-stage grid gap-8 py-14 md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)_minmax(0,4fr)] md:gap-10 md:py-20">
      <p className="text-sm font-medium text-ink-muted">{n} &mdash; <span className="text-accent-strong">{label}</span></p>
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-prose text-ink-soft">{body}</p>
        {more && <p className="mt-4 max-w-prose text-ink-soft">{more}</p>}
      </div>
      <div className="flex min-w-0 md:justify-end">{children}</div>
    </section>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-t border-line pt-5">
      <dt className="text-lg font-semibold">{q}</dt>
      <dd className="mt-2 max-w-prose text-ink-soft">{a}</dd>
    </div>
  );
}

function Spec({ term, desc }: { term: React.ReactNode; desc: string }) {
  return (
    <div className="border-t border-line pt-4">
      <dt className="font-semibold">{term}</dt>
      <dd className="mt-1 text-ink-soft">{desc}</dd>
    </div>
  );
}

/** Placeholder QR blocks: a deterministic pattern, never a scannable code. */
function QrBlock({ className = "", cells = 8 }: { className?: string; cells?: number }) {
  return (
    <span className={`grid gap-px bg-white ${className}`} style={{ gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))` }} aria-hidden>
      {Array.from({ length: cells * cells }, (_, i) => (
        <span key={i} className={(i * 7) % 5 < 2 || i % 3 === 0 ? "bg-ink" : "bg-white"} />
      ))}
    </span>
  );
}

function PassVisual({ stamps, total, name, reward, code }: { stamps: number; total: number; name: string; reward: string; code: string }) {
  return (
    <figure className="mk-phone" aria-label={`Example wallet pass with ${stamps} of ${total} stamps`}>
      <div className="mk-pass">
        <div className="flex items-center justify-between text-xs opacity-90"><span>{name}</span><span>Perk</span></div>
        <div className="mt-5 flex items-end justify-between">
          <p className="text-[11px] uppercase tracking-wide opacity-80">Stamps</p>
          <p className="text-2xl font-semibold leading-none">{stamps} <span className="text-base opacity-80">/ {total}</span></p>
        </div>
        <div className="mt-3 rounded-xl bg-white p-3 text-ink"><StampGrid stamps={stamps} total={total} color="var(--accent)" size="sm" /></div>
        <p className="mt-4 text-[11px] uppercase tracking-wide opacity-80">Reward</p>
        <p className="text-sm font-medium">{reward}</p>
        <div className="mt-4 rounded-lg bg-white p-2 text-center">
          <QrBlock className="mx-auto h-14 w-14" />
          <p className="mt-1 font-mono text-[10px] text-ink">{code}</p>
        </div>
      </div>
    </figure>
  );
}

function SetupVisual() {
  return (
    <figure className="w-full max-w-xs rounded-card border border-line bg-paper p-5" aria-label="Setup preview: your shop URL and staff PIN">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your URL</p>
      <p className="mt-1 font-mono text-sm">{APP_HOST}/<span className="rounded bg-accent-soft px-1 text-accent-strong">your-shop</span></p>
      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-muted">Staff PIN</p>
      <p className="mt-2 font-mono text-2xl leading-none tracking-[0.3em]">••••••</p>
    </figure>
  );
}

function PosterVisual() {
  return (
    <figure className="w-56 rounded-2xl bg-accent p-5 text-center text-accent-ink" aria-label="Counter poster preview">
      <p className="text-lg font-semibold leading-tight">Get a free coffee</p>
      <p className="mt-1 text-xs opacity-90">Collect 10 stamps</p>
      <QrBlock className="mx-auto mt-4 h-24 w-24 rounded-lg p-2" />
      <p className="mt-3 text-[11px] leading-snug opacity-90">Scan to add to Apple or Google Wallet, or have it emailed to you.</p>
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
    <figure className="w-full max-w-xs rounded-card border border-line bg-paper" aria-label="Activity ledger preview">
      <ul className="divide-y divide-line text-sm">
        {[["Redeemed", "ABCD-2345", "Staff"], ["Reward earned", "ABCD-2345", "Staff"], ["Stamp", "ABCD-2345", "Staff"], ["Adjusted +1", "QRST-7890", "Owner"]].map(([t, c, s]) => (
          <li key={t + c} className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="font-medium">{t}</span><span className="font-mono text-ink-soft">{c}</span><span className="text-ink-muted">{s}</span></li>
        ))}
      </ul>
    </figure>
  );
}
