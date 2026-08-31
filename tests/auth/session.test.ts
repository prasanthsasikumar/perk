import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb } from "../helpers/db";
import { resolveOwnerLanding, assertLoginAllowed } from "@/lib/auth/helpers";
import { RateLimited } from "@/lib/domain/errors";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

describe("session helpers", () => {
  it("routes owners by shop presence", () => {
    expect(resolveOwnerLanding(true)).toBe("/dashboard");
    expect(resolveOwnerLanding(false)).toBe("/onboarding");
  });
  it("limits magic-link requests to 5 per 15 minutes per email", async () => {
    const now = new Date();
    for (let i = 0; i < 5; i++) await assertLoginAllowed(t.db, "Owner@Cafe.com", now);
    await expect(assertLoginAllowed(t.db, "owner@cafe.com", now)).rejects.toBeInstanceOf(RateLimited);
  });
});
