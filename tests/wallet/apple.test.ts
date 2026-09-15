import { describe, it, expect } from "vitest";
import { buildPassJson, hexToRgb } from "@/lib/wallet/apple";
import type { Card, Shop } from "@/lib/db/schema";

const shop = { id: "s1", slug: "cafe", name: "Café", brandColor: "#c96a2b", stampsRequired: 10, rewardText: "Free coffee", rewardTiers: [], stampStyle: "check", logoUrl: null } as unknown as Shop;
const card = { id: "11111111-2222-3333-4444-555555555555", shortCode: "ABCD2345", stamps: 3, pendingRewards: [], appleAuthToken: "tok123" } as unknown as Card;
const opts = { appUrl: "https://perk.app", passTypeId: "pass.app.perk.card", teamId: "TEAM1" };

describe("buildPassJson", () => {
  it("builds a storeCard with stamps, barcode and web service", () => {
    const p = buildPassJson(shop, card, opts);
    expect(p.serialNumber).toBe(card.id);
    expect(p.webServiceURL).toBe("https://perk.app/api/wallet/apple");
    expect(p.authenticationToken).toBe("tok123");
    expect(p.barcodes[0]).toMatchObject({ format: "PKBarcodeFormatQR", message: card.id, altText: "ABCD2345" });
    expect(p.storeCard.headerFields[0].value).toBe("3/10");
    expect(p.storeCard.primaryFields).toEqual([]);
    expect(p.storeCard.auxiliaryFields).toEqual([]);
    expect(p.backgroundColor).toBe("rgb(201,106,43)");
    expect(p.storeCard.backFields.find((f) => f.key === "link")?.value).toBe(`https://perk.app/cafe/card/${card.id}`);
  });
  it("shows rewards ready when available", () => {
    const p = buildPassJson(shop, { ...card, pendingRewards: ["Free coffee", "Free coffee"] }, opts);
    expect(p.storeCard.auxiliaryFields[0]).toMatchObject({ key: "ready", value: "Free coffee ×2" });
    const tiered = buildPassJson({ ...shop, rewardTiers: [{ stamps: 5, reward: "Free coffee" }], rewardText: "Free gelato" }, { ...card, pendingRewards: ["Free coffee", "Free gelato"] }, opts);
    expect(tiered.storeCard.auxiliaryFields[0].value).toBe("Free coffee · Free gelato");
    expect(tiered.storeCard.backFields.find((f) => f.key === "how")?.value).toContain("5 stamps: Free coffee · 10 stamps: Free gelato");
  });
  it("hexToRgb falls back on bad input", () => {
    expect(hexToRgb("nope")).toBe("rgb(31,31,31)");
  });
});
