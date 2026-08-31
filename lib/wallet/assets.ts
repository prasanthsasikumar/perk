import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(process.cwd(), "public", "pass");
const cache = new Map<string, Buffer>();

export function defaultAsset(name: "icon.png" | "icon@2x.png" | "icon@3x.png" | "logo.png" | "logo@2x.png" | "logo@3x.png"): Buffer {
  let b = cache.get(name);
  if (!b) {
    b = readFileSync(path.join(dir, name));
    cache.set(name, b);
  }
  return b;
}

type LogoSet = { "logo.png": Buffer; "logo@2x.png": Buffer; "logo@3x.png": Buffer };
const logoCache = new Map<string, { at: number; set: LogoSet }>();
const LOGO_TTL_MS = 10 * 60_000;

/** Shop logo rendered to Apple's logo sizes (left-aligned, transparent). Falls back to the Perk mark. */
export async function shopLogoSet(logoUrl: string | null): Promise<LogoSet> {
  if (!logoUrl) return { "logo.png": defaultAsset("logo.png"), "logo@2x.png": defaultAsset("logo@2x.png"), "logo@3x.png": defaultAsset("logo@3x.png") };
  const hit = logoCache.get(logoUrl);
  if (hit && Date.now() - hit.at < LOGO_TTL_MS) return hit.set;
  try {
    const res = await fetch(logoUrl);
    if (!res.ok) throw new Error(`logo fetch ${res.status}`);
    const src = Buffer.from(await res.arrayBuffer());
    const render = (w: number, h: number) =>
      sharp(src, { density: 300 })
        .resize(h, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({ top: 0, bottom: 0, left: 0, right: w - h, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    const set: LogoSet = { "logo.png": await render(160, 50), "logo@2x.png": await render(320, 100), "logo@3x.png": await render(480, 150) };
    logoCache.set(logoUrl, { at: Date.now(), set });
    return set;
  } catch (e) {
    console.warn("[wallet] logo render failed, using default", e);
    return { "logo.png": defaultAsset("logo.png"), "logo@2x.png": defaultAsset("logo@2x.png"), "logo@3x.png": defaultAsset("logo@3x.png") };
  }
}
