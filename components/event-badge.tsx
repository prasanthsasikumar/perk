import { Badge } from "@/components/ui/badge";
import type { EventType } from "@/lib/db/schema";

const LABELS: Record<EventType, { text: string; tone: "neutral" | "accent" | "ok" | "danger" }> = {
  card_created: { text: "New card", tone: "neutral" },
  stamp: { text: "Stamp", tone: "accent" },
  reward_earned: { text: "Reward earned", tone: "ok" },
  redeem: { text: "Redeemed", tone: "ok" },
  adjust: { text: "Adjusted", tone: "danger" },
};

export function EventBadge({ type }: { type: EventType }) {
  const l = LABELS[type];
  return <Badge tone={l.tone}>{l.text}</Badge>;
}

export const SOURCE_LABELS: Record<string, string> = { barista_scan: "Staff", customer_scan: "Customer QR", owner_adjust: "Owner", system: "System" };

export function fmtTime(d: Date): string {
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
