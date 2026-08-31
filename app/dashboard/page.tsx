import Link from "next/link";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { getShopStats, recentEvents } from "@/lib/db/queries/events";
import { getEnv } from "@/lib/env";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { Card, CardTitle } from "@/components/ui/card";
import { EventBadge, SOURCE_LABELS, fmtTime } from "@/components/event-badge";

export const metadata = { title: "Overview" };

export default async function OverviewPage({ searchParams }: PageProps<"/dashboard">) {
  const { shop } = await requireShop();
  const sp = await searchParams;
  const [stats, recent] = await Promise.all([getShopStats(db, shop.id), recentEvents(db, shop.id, 10)]);
  const url = `${getEnv().NEXT_PUBLIC_APP_URL}/${shop.slug}`;
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-ink-soft">{shop.name}</p>
        </div>
        <Badge tone="accent">{shop.stampMode === "barista" ? "Staff scan customers" : "Customers scan QR"}</Badge>
      </div>

      {sp.welcome === "1" && (
        <Card className="border-accent/40 bg-accent-soft/40">
          <CardTitle>Your card is live 🎉</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">Next: print the counter poster so customers can grab their card, and share the staff link with your team.</p>
          <Link href="/dashboard/print" className="mt-3 inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-cream">Go to Print</Link>
        </Card>
      )}

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Your customer URL</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <a href={url} target="_blank" rel="noreferrer" className="font-mono text-lg text-ink underline decoration-line underline-offset-4">{url}</a>
          <CopyButton text={url} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Cards" value={stats.totalCards} />
        <Stat label="Stamps today" value={stats.stampsToday} />
        <Stat label="Stamps · 7 days" value={stats.stamps7d} />
        <Stat label="Rewards earned" value={stats.rewardsEarned} />
        <Stat label="Rewards redeemed" value={stats.rewardsRedeemed} />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Recent activity</CardTitle>
          <Link href="/dashboard/activity" className="text-sm text-accent underline">See all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing yet. Once customers add cards and get stamped, it shows up here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="flex items-center gap-3"><EventBadge type={e.type} /><span className="font-mono text-ink-soft">{e.cardShortCode}</span></div>
                <div className="text-right text-ink-muted"><span>{SOURCE_LABELS[e.source] ?? e.source}</span> · <time>{fmtTime(e.createdAt)}</time></div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
