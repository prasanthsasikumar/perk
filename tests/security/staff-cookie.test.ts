import { describe, it, expect } from "vitest";
import { signStaffCookie, verifyStaffCookie, staffCookieName } from "@/lib/security/staff-cookie";

describe("staff cookie", () => {
  const payload = { shopId: "11111111-1111-1111-1111-111111111111", pinVersion: 3 };
  it("round-trips", () => {
    expect(verifyStaffCookie(signStaffCookie(payload, "k"), "k")).toEqual(payload);
  });
  it("rejects tamper / wrong secret / malformed", () => {
    const v = signStaffCookie(payload, "k");
    expect(verifyStaffCookie(v + "x", "k")).toBeNull();
    expect(verifyStaffCookie(v, "other")).toBeNull();
    expect(verifyStaffCookie("nodot", "k")).toBeNull();
    expect(verifyStaffCookie(undefined, "k")).toBeNull();
  });
  it("names cookie per shop", () => {
    expect(staffCookieName("abc")).toBe("perk_staff_abc");
  });
});
