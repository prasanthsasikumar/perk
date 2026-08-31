/** Seeds a deterministic shop for the Playwright smoke test. Run: npm run e2e:seed */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(sql, { schema });

async function main() {
  const existing = await db.select().from(schema.shops).where(eq(schema.shops.slug, "e2e-cafe"));
  if (existing.length === 0) {
    await db.insert(schema.shops).values({ slug: "e2e-cafe", name: "E2E Café", staffPin: "246810", qrSecret: "e2e-secret", brandColor: "#c96a2b", rewardText: "Free coffee", stampsRequired: 10 });
    console.log("seeded e2e-cafe");
  } else {
    await db.update(schema.shops).set({ staffPin: "246810", staffPinVersion: existing[0].staffPinVersion + 1, stampMode: "barista", stampsRequired: 10 }).where(eq(schema.shops.slug, "e2e-cafe"));
    console.log("reset e2e-cafe");
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
