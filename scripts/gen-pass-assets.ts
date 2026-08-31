/** Generates default Apple Wallet pass images from public/perk-mark.svg. Run: npx tsx scripts/gen-pass-assets.ts */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const mark = readFileSync("public/perk-mark.svg");
const out = async (name: string, w: number, h: number) => {
  const png = await sharp(mark, { density: 400 })
    .resize(Math.round(h * 0.8), Math.round(h * 0.8), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: Math.round(h * 0.1), bottom: h - Math.round(h * 0.8) - Math.round(h * 0.1), left: Math.round(h * 0.1), right: w - Math.round(h * 0.8) - Math.round(h * 0.1), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  writeFileSync(`public/pass/${name}`, png);
  console.log("wrote", name, w, h);
};
(async () => {
  await out("icon.png", 29, 29);
  await out("icon@2x.png", 58, 58);
  await out("icon@3x.png", 87, 87);
  await out("logo.png", 160, 50);
  await out("logo@2x.png", 320, 100);
  await out("logo@3x.png", 480, 150);
})();
