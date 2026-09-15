import { describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { readFileSync } from "node:fs";

/** The 0001 migration must turn the old rewards_available counter into banked reward labels. */
describe("0001_reward_tiers backfill", () => {
  it("copies each banked reward as the shop's reward_text", async () => {
    const client = new PGlite();
    const db = drizzle(client);
    // Apply only the base schema, seed legacy rows, then run the remaining migrations.
    const base = readFileSync("./drizzle/0000_ordinary_chronomancer.sql", "utf8").split("--> statement-breakpoint");
    for (const stmt of base) await client.exec(stmt);
    await client.exec(`INSERT INTO shops (id, slug, name, reward_text, staff_pin, qr_secret) VALUES ('00000000-0000-0000-0000-000000000001', 's', 'S', 'Free flat white', '111111', 'q')`);
    await client.exec(`INSERT INTO cards (id, shop_id, short_code, rewards_available, apple_auth_token) VALUES
      ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000001', 'AAAA1111', 2, 't'),
      ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000001', 'BBBB2222', 0, 't')`);
    await client.exec(`CREATE SCHEMA IF NOT EXISTS drizzle; CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint);
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ('base', 1788184145613)`);
    await migrate(db, { migrationsFolder: "./drizzle" });
    const rows = await client.query<{ short_code: string; pending_rewards: string[] }>(`SELECT short_code, pending_rewards FROM cards ORDER BY short_code`);
    expect(rows.rows).toEqual([
      { short_code: "AAAA1111", pending_rewards: ["Free flat white", "Free flat white"] },
      { short_code: "BBBB2222", pending_rewards: [] },
    ]);
    const cols = await client.query<{ column_name: string }>(`SELECT column_name FROM information_schema.columns WHERE table_name = 'cards'`);
    expect(cols.rows.map((r) => r.column_name)).not.toContain("rewards_available");
    await client.close();
  });
});
