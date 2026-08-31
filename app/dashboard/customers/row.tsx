"use client";

import { useActionState, useEffect, useState } from "react";
import { adjustCard, cardHistory, type AdjustState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StampGrid } from "@/components/stamp-grid";
import { EventBadge, SOURCE_LABELS } from "@/components/event-badge";
import type { EventType } from "@/lib/db/schema";

export type RowCard = { id: string; shortCode: string; email: string | null; stamps: number; rewardsAvailable: number; lastStampedAt: string | null; createdAt: string };
type Hist = Awaited<ReturnType<typeof cardHistory>>;

export function CustomerRow({ card, stampsRequired, brandColor }: { card: RowCard; stampsRequired: number; brandColor: string }) {
  const [open, setOpen] = useState(false);
  const last = card.lastStampedAt ? new Date(card.lastStampedAt) : null;
  return (
    <>
      <tr className="cursor-pointer hover:bg-cream/60" onClick={() => setOpen((o) => !o)}>
        <td className="px-4 py-3 font-mono">{card.shortCode}</td>
        <td className="px-4 py-3 text-ink-soft">{card.email ?? <span className="text-ink-muted">—</span>}</td>
        <td className="px-4 py-3 tabular-nums">{card.stamps} / {stampsRequired}</td>
        <td className="px-4 py-3 tabular-nums">{card.rewardsAvailable > 0 ? <span className="font-medium text-ok">{card.rewardsAvailable} ready</span> : "0"}</td>
        <td className="px-4 py-3 text-ink-soft">{last ? last.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : <span className="text-ink-muted">never</span>}</td>
        <td className="px-4 py-3 text-right text-ink-muted">{open ? "▴" : "▾"}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="bg-cream/60 px-4 py-4">
            <Drawer card={card} stampsRequired={stampsRequired} brandColor={brandColor} />
          </td>
        </tr>
      )}
    </>
  );
}

function Drawer({ card, stampsRequired, brandColor }: { card: RowCard; stampsRequired: number; brandColor: string }) {
  const [hist, setHist] = useState<Hist | null>(null);
  const [state, action, pending] = useActionState<AdjustState, FormData>(adjustCard, {});
  const [delta, setDelta] = useState(1);
  useEffect(() => { cardHistory(card.id).then(setHist); }, [card.id, state.ok]);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">History</p>
        {!hist ? <p className="mt-2 text-sm text-ink-muted">Loading…</p> : (
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-paper">
            {hist.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <div className="flex items-center gap-2"><EventBadge type={e.type as EventType} />{e.type === "adjust" && <span className="tabular-nums">{e.delta > 0 ? `+${e.delta}` : e.delta}</span>}{e.note && <span className="text-ink-soft">“{e.note}”</span>}</div>
                <span className="text-ink-muted">{SOURCE_LABELS[e.source] ?? e.source}{e.actor && e.source === "owner_adjust" ? ` (${e.actor})` : ""} · {new Date(e.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form action={action} className="space-y-3 rounded-xl border border-line bg-paper p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Fix stamps</p>
        <StampGrid stamps={card.stamps} total={stampsRequired} color={brandColor} size="sm" />
        <input type="hidden" name="cardId" value={card.id} />
        <input type="hidden" name="delta" value={delta} />
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setDelta((d) => Math.max(-stampsRequired, d - 1 === 0 ? -1 : d - 1))}>−</Button>
          <span className="w-14 text-center font-mono text-lg tabular-nums">{delta > 0 ? `+${delta}` : delta}</span>
          <Button type="button" variant="secondary" size="sm" onClick={() => setDelta((d) => Math.min(stampsRequired, d + 1 === 0 ? 1 : d + 1))}>+</Button>
        </div>
        <Input name="note" placeholder="Reason (required), e.g. missed stamp on Tuesday" required />
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.ok && <p className="text-sm text-ok">Updated.</p>}
        <Button type="submit" size="sm" loading={pending}>Apply</Button>
      </form>
    </div>
  );
}
