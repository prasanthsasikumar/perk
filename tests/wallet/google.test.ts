import { describe, it, expect } from "vitest";
import { generateKeyPair, exportPKCS8, jwtVerify } from "jose";
import { buildLoyaltyClass, buildLoyaltyObject, buildSaveJwt } from "@/lib/wallet/google";
import type { Card, Shop } from "@/lib/db/schema";

const shop = { id: "shop-1", slug: "cafe", name: "Café", brandColor: "#c96a2b", stampsRequired: 10, rewardText: "Free coffee", logoUrl: null } as Shop;
const card = { id: "card-1", shortCode: "ABCD2345", stamps: 3, rewardsAvailable: 1 } as Card;

describe("google wallet builders", () => {
  it("class", () => {
    const c = buildLoyaltyClass(shop, "3388000000000000000", "https://perk.app");
    expect(c.id).toBe("3388000000000000000.shop-1");
    expect(c.programName).toBe("Café");
    expect(c.programLogo.sourceUri.uri).toBe("https://perk.app/pass/logo@3x.png");
    expect(c.hexBackgroundColor).toBe("#c96a2b");
  });
  it("object", () => {
    const o = buildLoyaltyObject(shop, card, "ISS", "https://perk.app");
    expect(o.id).toBe("ISS.card-1");
    expect(o.classId).toBe("ISS.shop-1");
    expect(o.loyaltyPoints.balance.string).toBe("3 / 10");
    expect(o.secondaryLoyaltyPoints.balance.int).toBe(1);
    expect(o.barcode).toEqual({ type: "QR_CODE", value: "card-1", alternateText: "ABCD2345" });
    expect(o.linksModuleData.uris[0].uri).toBe("https://perk.app/cafe/card/card-1");
  });
  it("save JWT verifies and carries the object", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
    const pem = await exportPKCS8(privateKey);
    const o = buildLoyaltyObject(shop, card, "ISS", "https://perk.app");
    const jwt = await buildSaveJwt(o, null, "sa@proj.iam.gserviceaccount.com", pem, ["https://perk.app"]);
    const { payload } = await jwtVerify(jwt, publicKey, { audience: "google", issuer: "sa@proj.iam.gserviceaccount.com" });
    expect(payload.typ).toBe("savetowallet");
    expect((payload.payload as { loyaltyObjects: { id: string }[] }).loyaltyObjects[0].id).toBe("ISS.card-1");
  });
});
