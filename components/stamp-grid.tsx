import type { StampStyle } from "@/lib/db/schema";
import { STAMP_ICONS } from "@/lib/stamp-icons";

export type StampGridProps = {
  stamps: number;
  total: number;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Stamp cell style (template). */
  style?: StampStyle;
  /** 1-based positions that bank a bonus reward; drawn with an outer ring. */
  milestones?: number[];
};

/** Row(s) of stamp cells. Server-safe. */
export function StampGrid({ stamps, total, color, size = "md", className = "", style = "check", milestones = [] }: StampGridProps) {
  const dim = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const cols = total <= 5 ? total : total <= 8 ? 4 : 5;
  return (
    <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="img" aria-label={`${stamps} of ${total} stamps`}>
      {Array.from({ length: total }, (_, i) => {
        const filled = i < stamps;
        const milestone = milestones.includes(i + 1);
        return (
          <span
            key={i}
            aria-hidden
            className={`flex ${dim} items-center justify-center rounded-full border-2 transition-colors`}
            style={{
              ...(filled ? { background: color, borderColor: color, color: "#fff" } : { borderColor: `${color}55`, color: `${color}88` }),
              ...(milestone ? { outline: `2px solid ${color}`, outlineOffset: 2 } : {}),
            }}
          >
            {filled && <StampIcon style={style} className="h-[60%] w-[60%]" />}
          </span>
        );
      })}
    </div>
  );
}

export function StampIcon({ style, className = "" }: { style: StampStyle; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {STAMP_ICONS[style].map((p, i) =>
        p.kind === "fill" ? <path key={i} d={p.d} fill="currentColor" /> : <path key={i} d={p.d} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />,
      )}
    </svg>
  );
}
