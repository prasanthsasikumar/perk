import { describe, it, expect } from "vitest";
import { makeTracker, type CaptureClient } from "@/lib/analytics";

describe("makeTracker", () => {
  it("captures an event with the shop as a group and an anonymous fallback id", () => {
    const calls: Parameters<CaptureClient["capture"]>[0][] = [];
    const track = makeTracker({ capture: (e) => { calls.push(e); } });
    track("card_issued", { platform: "apple" }, { shopSlug: "cafe-test" });
    expect(calls).toEqual([{ distinctId: "shop:cafe-test", event: "card_issued", properties: { platform: "apple", shop: "cafe-test" }, groups: { shop: "cafe-test" } }]);
  });
  it("uses an explicit distinct id when given", () => {
    const calls: Parameters<CaptureClient["capture"]>[0][] = [];
    const track = makeTracker({ capture: (e) => { calls.push(e); } });
    track("owner_signed_in", { new_user: true }, { distinctId: "owner@x.com" });
    expect(calls[0]).toMatchObject({ distinctId: "owner@x.com", event: "owner_signed_in" });
    expect(calls[0].groups).toBeUndefined();
  });
  it("is a silent no-op without a client", () => {
    const track = makeTracker(null);
    expect(() => track("card_stamped", {}, { shopSlug: "x" })).not.toThrow();
  });
  it("never throws when the client does", () => {
    const track = makeTracker({ capture: () => { throw new Error("network"); } });
    expect(() => track("card_stamped", {}, { shopSlug: "x" })).not.toThrow();
  });
});
