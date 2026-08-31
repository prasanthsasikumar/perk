import Link from "next/link";
import { requireShop } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { buildScanUrl } from "@/lib/security/hmac";
import { Qr } from "@/components/qr";
import { PrintButton } from "./print-button";
import "./print.css";

export const metadata = { title: "Print" };

type Sheet = "landing" | "scan" | "staff";

export default async function PrintPage({ searchParams }: PageProps<"/dashboard/print">) {
  const { shop } = await requireShop();
  const sp = await searchParams;
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
  const sheet: Sheet | null = sp.sheet === "landing" || sp.sheet === "scan" || sp.sheet === "staff" ? sp.sheet : null;
  const landingUrl = `${appUrl}/${shop.slug}`;
  const scanUrl = buildScanUrl(appUrl, shop);
  const staffUrl = `${appUrl}/${shop.slug}/staff`;

  if (sheet) {
    return (
      <div className="print-sheet mx-auto max-w-[210mm]">
        <div className="no-print mb-6 flex items-center justify-between">
          <Link href="/dashboard/print" className="text-sm text-accent underline">← All printables</Link>
          <PrintButton />
        </div>
        {sheet === "landing" && (
          <Poster color={shop.brandColor} title={`Get a free ${shop.rewardText.toLowerCase().replace(/^free\s+/, "")}`} subtitle={`Collect ${shop.stampsRequired} stamps at ${shop.name}`} qr={landingUrl} footer="Scan to add your stamp card to Apple Wallet or Google Wallet. No app, no sign-up." url={landingUrl} logoUrl={shop.logoUrl} name={shop.name} />
        )}
        {sheet === "scan" && (
          <Poster color={shop.brandColor} title="Scan to stamp" subtitle={`One stamp per visit · ${shop.stampsRequired} stamps = ${shop.rewardText}`} qr={scanUrl} footer="Bought a coffee? Scan this with your phone camera to add a stamp to your card." url={landingUrl} logoUrl={shop.logoUrl} name={shop.name} />
        )}
        {sheet === "staff" && (
          <div className="rounded-3xl border border-line bg-paper p-10 text-ink">
            <p className="text-sm uppercase tracking-wide text-ink-muted">Staff card · {shop.name}</p>
            <h1 className="mt-2 text-3xl font-semibold">Stamping customers</h1>
            <ol className="mt-6 list-decimal space-y-2 pl-5 text-lg">
              <li>Open <span className="font-mono">{staffUrl}</span> on any phone.</li>
              <li>Enter the PIN <span className="font-mono text-2xl tracking-[0.3em]">{shop.staffPin}</span> (stays signed in 30 days).</li>
              <li>Scan the customer&rsquo;s pass, or type their card code. Tap <b>+1 stamp</b> or <b>Redeem</b>.</li>
            </ol>
            <div className="mt-8 flex items-center gap-6">
              <Qr value={staffUrl} size={140} label="Staff page QR" />
              <p className="text-sm text-ink-soft">Scan to open the staff page. Keep this sheet behind the counter — the PIN is private.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Print</h1>
        <p className="text-ink-soft">A4 sheets for the counter and your team. Open one, then print.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SheetCard href="/dashboard/print?sheet=landing" title="Counter poster" body="“Get your free coffee card” with a QR to your URL. Every shop needs this one." />
        {shop.stampMode === "customer" && <SheetCard href="/dashboard/print?sheet=scan" title="Scan-to-stamp poster" body="The QR customers scan after buying. Rotate it in Settings if it leaks." />}
        <SheetCard href="/dashboard/print?sheet=staff" title="Staff card" body="Staff URL, PIN and three-step instructions. Keep behind the counter." />
      </div>
    </div>
  );
}

function SheetCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="block rounded-card border border-line bg-paper p-5 transition-colors hover:border-accent/50 hover:bg-accent-soft/30">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
      <p className="mt-3 text-sm text-accent underline">Open sheet →</p>
    </Link>
  );
}

function Poster({ color, title, subtitle, qr, footer, url, logoUrl, name }: { color: string; title: string; subtitle: string; qr: string; footer: string; url: string; logoUrl: string | null; name: string }) {
  return (
    <div className="poster flex flex-col items-center rounded-3xl p-12 text-center text-white" style={{ background: color, minHeight: "270mm" }}>
      <div className="flex items-center gap-3">
        {logoUrl ? <img src={logoUrl} alt="" className="h-16 w-16 rounded-2xl bg-white object-contain p-1" /> : <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold">{name.slice(0, 1)}</span>}
        <span className="text-2xl font-semibold">{name}</span>
      </div>
      <h1 className="mt-14 text-5xl font-semibold leading-tight">{title}</h1>
      <p className="mt-4 text-xl opacity-90">{subtitle}</p>
      <div className="mt-12"><Qr value={qr} size={300} label="QR code" /></div>
      <p className="mt-10 max-w-md text-lg opacity-90">{footer}</p>
      <p className="mt-auto pt-10 font-mono text-sm opacity-80">{url}</p>
    </div>
  );
}
