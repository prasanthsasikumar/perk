/** Generates a signed .pkpass for the demo shop's card to verify Apple config. */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { db } from "../lib/db/client";
import { getShopBySlug } from "../lib/db/queries/shops";
import { cards } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { buildApplePass, isAppleConfigured } from "../lib/wallet/apple";

async function main() {
  console.log("apple configured:", isAppleConfigured(), "| dry-run:", process.env.WALLET_DRY_RUN ?? "(unset)");
  const shop = await getShopBySlug(db, "demo-cafe");
  if (!shop) throw new Error("demo-cafe shop missing");
  const [card] = await db.select().from(cards).where(eq(cards.shopId, shop.id)).limit(1);
  if (!card) throw new Error("no card");
  const buf = await buildApplePass(shop, card);
  const out = "/Users/prasanthsasikumar/Desktop/Perk Pass Signing/demo-cafe.pkpass";
  writeFileSync(out, buf);
  console.log("wrote", out, buf.length, "bytes; magic:", buf.subarray(0, 2).toString());
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
