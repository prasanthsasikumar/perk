import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getEnv } from "@/lib/env";

const globalForDb = globalThis as unknown as { _pg?: ReturnType<typeof postgres> };

// `prepare: false` is required for Supabase's transaction-mode pooler.
const sql = globalForDb._pg ?? postgres(getEnv().DATABASE_URL, { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb._pg = sql;

export const db = drizzle(sql, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type DbOrTx = Db | Tx;
