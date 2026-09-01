import { Resvg } from "@resvg/resvg-js";

export type StripOptions = { stamps: number; total: number; color: string; width?: number; height?: number };

/**
 * Apple storeCard strip (375×123 pt at 1x), drawn to match the Perk card mockup:
 * a white rounded panel holding the stamp grid — filled stamps are solid brand-colour
 * circles with a white check; empty stamps are white circles with an ink outline.
 */
export function renderStripSvg({ stamps, total, color, width = 375, height = 123 }: StripOptions): string {
  // Rows of at most 5 so circles stay large (max 3 rows).
  const rows = Math.min(3, Math.ceil(total / 5));
  const perRow = Math.ceil(total / rows);

  // White panel inset from the strip edges.
  const margin = 10;
  const panelX = margin;
  const panelY = margin;
  const panelW = width - margin * 2;
  const panelH = height - margin * 2;
  const panelR = 18;

  const padX = 22;
  const padY = 14;
  const cellW = (panelW - padX * 2) / perRow;
  const cellH = (panelH - padY * 2) / rows;
  const r = Math.min(cellW, cellH) * 0.42;

  const circles: string[] = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / perRow);
    const inRow = row === rows - 1 ? total - perRow * (rows - 1) : perRow;
    // Center the (possibly short) last row.
    const col = i - row * perRow;
    const rowW = cellW * inRow;
    const startX = panelX + padX + (panelW - padX * 2 - rowW) / 2;
    const cx = startX + cellW * col + cellW / 2;
    const cy = panelY + padY + cellH * row + cellH / 2;
    const filled = i < stamps;
    if (filled) {
      circles.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>` +
          `<path d="M${(cx - r * 0.42).toFixed(1)} ${(cy + r * 0.05).toFixed(1)} l${(r * 0.3).toFixed(1)} ${(r * 0.32).toFixed(1)} l${(r * 0.58).toFixed(1)} -${(r * 0.66).toFixed(1)}" stroke="#ffffff" stroke-width="${(r * 0.24).toFixed(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    } else {
      circles.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r - 1).toFixed(1)}" fill="#ffffff" stroke="#1c1917" stroke-width="2.5"/>`,
      );
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${panelR}" fill="#ffffff"/>` +
    circles.join("") +
    `</svg>`
  );
}

export async function renderStripPng(opts: StripOptions & { scale?: 1 | 2 | 3 }): Promise<Buffer> {
  const scale = opts.scale ?? 1;
  const svg = renderStripSvg(opts);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: (opts.width ?? 375) * scale } });
  return Buffer.from(resvg.render().asPng());
}
