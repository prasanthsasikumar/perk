import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/lib/db/schema";
import type { Db } from "@/lib/db/client";

/** Fresh in-memory Postgres with all migrations applied. */
export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Db;
  await migrate(db as never, { migrationsFolder: "./drizzle" });
  return { db, close: () => client.close() };
}

export function fakeShop(overrides: Partial<schema.NewShop> = {}): schema.NewShop {
  return { slug: "blue-bottle", name: "Blue Bottle", staffPin: "123456", qrSecret: "qr-secret", ...overrides };
}
