import Link from "next/link";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { listEvents } from "@/lib/db/queries/events";
import { EVENT_TYPES, type EventType } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { TypeFilter } from "./filter";
import { EventBadge, SOURCE_LABELS, fmtTime } from "@/components/event-badge";

export const metadata = { title: "Activity" };

/** Signed stamp change, blank for events that do not move the count. */
function delta(e: { type: EventType; delta: number }): string {
  if (e.type !== "stamp" && e.type !== "adjust") return "";
  return e.delta > 0 ? `+${e.delta}` : String(e.delta);
}

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
        <TypeFilter value={type ?? ""} />
      </div>
      <Card className="overflow-hidden p-0">
        {items.length === 0 ? <p className="p-6 text-sm text-ink-muted">No events yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr><th className="hidden px-4 py-3 font-medium sm:table-cell">When</th><th className="px-3 py-3 font-medium sm:px-4">Event</th><th className="px-3 py-3 font-medium sm:px-4">Card</th><th className="hidden px-4 py-3 font-medium sm:table-cell">Δ</th><th className="hidden px-4 py-3 font-medium md:table-cell">By</th><th className="hidden px-4 py-3 font-medium md:table-cell">Note</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((e) => (
                  <tr key={e.id}>
                    <td className="hidden whitespace-nowrap px-4 py-2.5 text-ink-soft sm:table-cell">{fmtTime(e.createdAt)}</td>
                    <td className="px-3 py-2.5 sm:px-4">
                      <EventBadge type={e.type} />
                      <span className="mt-1 block text-xs text-ink-muted sm:hidden">{fmtTime(e.createdAt)}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono sm:px-4">
                      {e.cardShortCode}
                      <span className="mt-1 block font-sans text-xs text-ink-muted md:hidden">
                        {delta(e)}{delta(e) ? " · " : ""}{SOURCE_LABELS[e.source] ?? e.source}{e.actor && e.source === "owner_adjust" ? ` · ${e.actor}` : ""}
                        {e.note ? ` · ${e.note}` : ""}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 tabular-nums sm:table-cell">{delta(e)}</td>
                    <td className="hidden px-4 py-2.5 text-ink-soft md:table-cell">{SOURCE_LABELS[e.source] ?? e.source}{e.actor && e.source === "owner_adjust" ? ` · ${e.actor}` : ""}</td>
                    <td className="hidden px-4 py-2.5 text-ink-soft md:table-cell">{e.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {moreHref && <div className="text-center"><Link href={moreHref} className="text-sm text-accent-strong underline">Load more</Link></div>}
    </div>
  );
}
