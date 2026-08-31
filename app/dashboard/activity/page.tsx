import Link from "next/link";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { listEvents } from "@/lib/db/queries/events";
import { EVENT_TYPES, type EventType } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { EventBadge, SOURCE_LABELS, fmtTime } from "@/components/event-badge";

export const metadata = { title: "Activity" };

export default async function ActivityPage({ searchParams }: PageProps<"/dashboard/activity">) {
  const { shop } = await requireShop();
  const sp = await searchParams;
  const type = typeof sp.type === "string" && (EVENT_TYPES as readonly string[]).includes(sp.type) ? (sp.type as EventType) : undefined;
  const cursor = typeof sp.cursor === "string" && /^\d+$/.test(sp.cursor) ? Number(sp.cursor) : null;
  const { items, nextCursor } = await listEvents(db, shop.id, { type, cursor, limit: 50 });
  const moreHref = nextCursor ? `/dashboard/activity?${new URLSearchParams({ ...(type ? { type } : {}), cursor: String(nextCursor) })}` : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-ink-soft">Every stamp, reward and adjustment, newest first.</p>
        </div>
        <form className="w-full sm:w-56">
          <Select name="type" defaultValue={type ?? ""} aria-label="Filter by type">
            <option value="">All events</option>
            <option value="stamp">Stamps</option>
            <option value="reward_earned">Rewards earned</option>
            <option value="redeem">Redemptions</option>
            <option value="adjust">Adjustments</option>
            <option value="card_created">New cards</option>
          </Select>
          <button type="submit" className="sr-only">Filter</button>
        </form>
      </div>
      <Card className="overflow-hidden p-0">
        {items.length === 0 ? <p className="p-6 text-sm text-ink-muted">No events yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr><th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">Event</th><th className="px-4 py-3 font-medium">Card</th><th className="px-4 py-3 font-medium">Δ</th><th className="px-4 py-3 font-medium">By</th><th className="px-4 py-3 font-medium">Note</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-soft">{fmtTime(e.createdAt)}</td>
                    <td className="px-4 py-2.5"><EventBadge type={e.type} /></td>
                    <td className="px-4 py-2.5 font-mono">{e.cardShortCode}</td>
                    <td className="px-4 py-2.5 tabular-nums">{e.type === "stamp" || e.type === "adjust" ? (e.delta > 0 ? `+${e.delta}` : e.delta) : ""}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{SOURCE_LABELS[e.source] ?? e.source}{e.actor && e.source === "owner_adjust" ? ` · ${e.actor}` : ""}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{e.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {moreHref && <div className="text-center"><Link href={moreHref} className="text-sm text-accent underline">Load more</Link></div>}
    </div>
  );
}
