import { describe, it, expect } from "vitest";
import { feedbackMailto, FEEDBACK_EMAIL } from "@/lib/feedback";

describe("feedbackMailto", () => {
  it("targets the feedback inbox with the shop slug in the subject", () => {
    expect(FEEDBACK_EMAIL).toBe("hello@flowsxr.com");
    expect(feedbackMailto("cafe-test")).toBe("mailto:hello@flowsxr.com?subject=Perk%20feedback%20(cafe-test)");
  });
  it("works without a shop", () => {
    expect(feedbackMailto()).toBe("mailto:hello@flowsxr.com?subject=Perk%20feedback");
  });
});
