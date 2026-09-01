import { describe, it, expect } from "vitest";
import { renderStripSvg, renderStripPng } from "@/lib/wallet/strip-image";

describe("strip image", () => {
  it("draws a white panel and one circle per stamp slot, filling the earned ones", () => {
    const svg = renderStripSvg({ stamps: 3, total: 10, color: "#c96a2b" });
    expect(svg.match(/<rect[^>]*fill="#ffffff"/g)).toHaveLength(1); // white panel
    expect(svg.match(/<circle/g)).toHaveLength(10);
    expect(svg.match(/fill="#c96a2b"/g)).toHaveLength(3); // solid filled stamps
    expect(svg.match(/<path/g)).toHaveLength(3); // white checks
    expect(svg.match(/stroke="#1c1917"/g)).toHaveLength(7); // outlined empties
  });
  it("wraps 10 stamps into two rows of five", () => {
    const svg = renderStripSvg({ stamps: 0, total: 10, color: "#000000" });
    expect(svg.match(/<circle/g)).toHaveLength(10);
    const xs = [...svg.matchAll(/cx="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(new Set(xs).size).toBe(5); // 5 columns
    const ys = [...svg.matchAll(/cy="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(new Set(ys).size).toBe(2); // 2 rows
  });
  it("caps at three rows for large totals", () => {
    const svg = renderStripSvg({ stamps: 0, total: 30, color: "#000000" });
    expect(svg.match(/<circle/g)).toHaveLength(30);
    const ys = [...svg.matchAll(/cy="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(new Set(ys).size).toBe(3);
  });
  it("renders a PNG", async () => {
    const png = await renderStripPng({ stamps: 5, total: 10, color: "#c96a2b", scale: 2 });
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(png.length).toBeGreaterThan(1000);
  });
});
