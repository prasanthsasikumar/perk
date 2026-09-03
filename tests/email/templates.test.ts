import { describe, it, expect } from "vitest";
import { buildMagicLinkEmail, buildCardLinkEmail } from "@/lib/email/templates";

const shop = { name: "Café Test", slug: "cafe-test", brandColor: "#123456", stampsRequired: 8, rewardText: "a free flat white", logoUrl: null };

describe("buildMagicLinkEmail", () => {
  it("uses a unique subject each time so mail clients don't thread them", () => {
    const a = buildMagicLinkEmail({ url: "https://x/a", host: "getperk.vercel.app", replyTo: "hello@flowsxr.com" });
    const b = buildMagicLinkEmail({ url: "https://x/b", host: "getperk.vercel.app", replyTo: "hello@flowsxr.com" });
    expect(a.subject).toMatch(/^Your Perk sign-in link · [a-z0-9]{4}$/);
    expect(a.subject).not.toBe(b.subject);
  });
  it("puts the link and the spam/reply footer in text and html", () => {
    const m = buildMagicLinkEmail({ url: "https://getperk.vercel.app/api/auth/callback/resend?token=abc&x=1", host: "getperk.vercel.app", replyTo: "hello@flowsxr.com" });
    expect(m.text).toContain("https://getperk.vercel.app/api/auth/callback/resend?token=abc&x=1");
    expect(m.html).toContain("https://getperk.vercel.app/api/auth/callback/resend?token=abc&amp;x=1");
    for (const body of [m.text, m.html]) {
      expect(body.toLowerCase()).toContain("spam");
      expect(body.toLowerCase()).toContain("reply");
    }
  });
});

describe("buildCardLinkEmail", () => {
  it("includes the card url, reward, and reply footer, with the shop name escaped", () => {
    const m = buildCardLinkEmail({ shop: { ...shop, name: "Bob's <Café>" }, url: "https://x/card/1" });
    expect(m.subject).toBe("Your Bob's <Café> stamp card");
    expect(m.text).toContain("https://x/card/1");
    expect(m.html).toContain("Bob&#39;s &lt;Café&gt;");
    expect(m.html).not.toContain("<Café>");
    expect(m.text.toLowerCase()).toContain("reply");
  });
});
