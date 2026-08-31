import { describe, it, expect } from "vitest";
import { buildPassJson, hexToRgb } from "@/lib/wallet/apple";
import type { Card, Shop } from "@/lib/db/schema";

const shop = { id: "s1", slug: "cafe", name: "Café", brandColor: "#c96a2b", stampsRequired: 10, rewardText: "Free coffee", logoUrl: null } as Shop;
const card = { id: "11111111-2222-3333-4444-555555555555", shortCode: "ABCD2345", stamps: 3, rewardsAvailable: 0, appleAuthToken: "tok123" } as Card;
const opts = { appUrl: "https://perk.app", passTypeId: "pass.app.perk.card", teamId: "TEAM1" };

describe("buildPassJson", () => {
  it("builds a storeCard with stamps, barcode and web service", () => {
    const p = buildPassJson(shop, card, opts);
    expect(p.serialNumber).toBe(card.id);
    expect(p.webServiceURL).toBe("https://perk.app/api/wallet/apple");
    expect(p.authenticationToken).toBe("tok123");
    expect(p.barcodes[0]).toMatchObject({ format: "PKBarcodeFormatQR", message: card.id, altText: "ABCD2345" });
    expect(p.storeCard.primaryFields[0].value).toBe("3 / 10");
    expect(p.storeCard.auxiliaryFields).toEqual([]);
    expect(p.backgroundColor).toBe("rgb(201,106,43)");
    expect(p.storeCard.backFields.find((f) => f.key === "link")?.value).toBe(`https://perk.app/cafe/card/${card.id}`);
  });
  it("shows rewards ready when available", () => {
    const p = buildPassJson(shop, { ...card, rewardsAvailable: 2 }, opts);
    expect(p.storeCard.auxiliaryFields[0]).toMatchObject({ key: "ready", value: "2" });
  });
  it("hexToRgb falls back on bad input", () => {
    expect(hexToRgb("nope")).toBe("rgb(31,31,31)");
  });
});
