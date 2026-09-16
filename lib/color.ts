/** Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour by a fraction of the distance to white/black. */
export function shadeHex(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const ch = (h: string) => {
    const v = parseInt(h, 16);
    const target = amount < 0 ? 0 : 255;
    const out = Math.round(v + (target - v) * Math.min(1, Math.abs(amount)));
    return out.toString(16).padStart(2, "0");
  };
  return `#${ch(m[1])}${ch(m[2])}${ch(m[3])}`;
}

/** Brand gradient for the hero card: brand colour fading to a slightly darker shade. */
export function brandGradient(hex: string): string {
  return `linear-gradient(180deg, ${hex} 0%, ${shadeHex(hex, -0.18)} 100%)`;
}
