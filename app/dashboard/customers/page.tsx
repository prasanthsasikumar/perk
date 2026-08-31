import Link from "next/link";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { listCards } from "@/lib/db/queries/cards";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CustomerRow } from "./row";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: PageProps<"/dashboard/customers">) {
  const { shop } = await requireShop();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const cursor = typeof sp.cursor === "string" ? sp.cursor : null;
  const { items, nextCursor } = await listCards(db, shop.id, { search: q || undefined, limit: 50, cursor });
  const moreHref = nextCursor ? `/dashboard/customers?${new URLSearchParams({ ...(q ? { q } : {}), cursor: nextCursor })}` : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-ink-soft">Every card, most recent visit first. Click a row to see history or fix a stamp.</p>
        </div>
        <form className="w-full sm:w-72">
          <Input name="q" defaultValue={q} placeholder="Search by card code or email" aria-label="Search customers" />
        </form>
      </div>

      <Card className="overflow-hidden p-0">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-ink-muted">{q ? "No cards match that search." : "No cards yet. Share your URL or print the poster to get started."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Card</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Stamps</th>
                  <th className="px-4 py-3 font-medium">Rewards</th>
                  <th className="px-4 py-3 font-medium">Last visit</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((c) => (
                  <CustomerRow key={c.id} card={{ id: c.id, shortCode: c.shortCode, email: c.email, stamps: c.stamps, rewardsAvailable: c.rewardsAvailable, lastStampedAt: c.lastStampedAt?.toISOString() ?? null, createdAt: c.createdAt.toISOString() }} stampsRequired={shop.stampsRequired} brandColor={shop.brandColor} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {moreHref && (
        <div className="text-center"><Link href={moreHref} className="text-sm text-accent underline">Load more</Link></div>
      )}
    </div>
  );
}
