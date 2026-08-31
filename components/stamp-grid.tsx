/** Row(s) of stamp circles. Server-safe. */
export function StampGrid({ stamps, total, color, size = "md", className = "" }: { stamps: number; total: number; color: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12 text-lg" : "h-9 w-9 text-sm";
  const cols = total <= 5 ? total : total <= 8 ? 4 : 5;
  return (
    <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="img" aria-label={`${stamps} of ${total} stamps`}>
      {Array.from({ length: total }, (_, i) => {
        const filled = i < stamps;
        return (
          <span
            key={i}
            aria-hidden
            className={`flex ${dim} items-center justify-center rounded-full border-2 font-semibold transition-colors`}
            style={filled ? { background: color, borderColor: color, color: "#fff" } : { borderColor: `${color}55`, color: `${color}88` }}
          >
            {filled ? "✓" : ""}
          </span>
        );
      })}
    </div>
  );
}
