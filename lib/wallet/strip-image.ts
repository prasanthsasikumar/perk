import { Resvg } from "@resvg/resvg-js";

export type StripOptions = { stamps: number; total: number; color: string; width?: number; height?: number };

/** Apple storeCard strip is 375×123 pt (1x). Circles laid out in rows of up to 10. */
export function renderStripSvg({ stamps, total, color, width = 375, height = 123 }: StripOptions): string {
  const perRow = Math.min(total, total > 10 ? Math.ceil(total / 2) : total);
  const rows = Math.ceil(total / perRow);
  const pad = 18;
  const cellW = (width - pad * 2) / perRow;
  const cellH = (height - pad) / rows;
  const r = Math.min(cellW, cellH) * 0.36;
  const circles: string[] = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const cx = pad + cellW * col + cellW / 2;
    const cy = pad / 2 + cellH * row + cellH / 2;
    const filled = i < stamps;
    circles.push(
      filled
        ? `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" stroke="#ffffff" stroke-width="2"/><path d="M${(cx - r * 0.45).toFixed(1)} ${cy.toFixed(1)} l${(r * 0.3).toFixed(1)} ${(r * 0.3).toFixed(1)} l${(r * 0.6).toFixed(1)} -${(r * 0.65).toFixed(1)}" stroke="#ffffff" stroke-width="${(r * 0.22).toFixed(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>`,
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${circles.join("")}</svg>`;
}

export async function renderStripPng(opts: StripOptions & { scale?: 1 | 2 | 3 }): Promise<Buffer> {
  const scale = opts.scale ?? 1;
  const svg = renderStripSvg(opts);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: (opts.width ?? 375) * scale } });
  return Buffer.from(resvg.render().asPng());
}
