import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb } from "../helpers/db";
import { checkRateLimit } from "@/lib/security/rate-limit";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

describe("checkRateLimit", () => {
  it("allows up to limit then denies, and resets after the window", async () => {
    const now = new Date("2026-01-01T00:00:00Z");
    for (let i = 0; i < 3; i++) expect((await checkRateLimit(t.db, "k1", 3, 60_000, now)).allowed).toBe(true);
    const denied = await checkRateLimit(t.db, "k1", 3, 60_000, now);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    const later = new Date(now.getTime() + 61_000);
    expect((await checkRateLimit(t.db, "k1", 3, 60_000, later)).allowed).toBe(true);
  });
  it("keys are independent", async () => {
    const now = new Date();
    await checkRateLimit(t.db, "a", 1, 60_000, now);
    expect((await checkRateLimit(t.db, "a", 1, 60_000, now)).allowed).toBe(false);
    expect((await checkRateLimit(t.db, "b", 1, 60_000, now)).allowed).toBe(true);
  });
});
