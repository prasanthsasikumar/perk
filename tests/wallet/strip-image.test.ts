import { describe, it, expect } from "vitest";
import { renderStripSvg, renderStripPng } from "@/lib/wallet/strip-image";

describe("strip image", () => {
  it("draws one circle per stamp slot and fills the earned ones", () => {
    const svg = renderStripSvg({ stamps: 3, total: 10, color: "#c96a2b" });
    expect(svg.match(/<circle/g)).toHaveLength(10);
    expect(svg.match(/fill="#c96a2b"/g)).toHaveLength(3);
    expect(svg.match(/<path/g)).toHaveLength(3);
  });
  it("wraps large totals onto two rows", () => {
    const svg = renderStripSvg({ stamps: 0, total: 20, color: "#000000" });
    expect(svg.match(/<circle/g)).toHaveLength(20);
  });
  it("renders a PNG", async () => {
    const png = await renderStripPng({ stamps: 5, total: 10, color: "#c96a2b", scale: 2 });
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(png.length).toBeGreaterThan(1000);
  });
});
