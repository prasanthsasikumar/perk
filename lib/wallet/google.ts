import { JWT } from "google-auth-library";
import { importPKCS8, SignJWT } from "jose";
import type { Card, Shop } from "@/lib/db/schema";
import { getEnv, pemFromEnv } from "@/lib/env";
import { db } from "@/lib/db/client";
import { setGoogleClassId } from "@/lib/db/queries/shops";
import { setGoogleObjectId } from "@/lib/db/queries/cards";
import type { PassArtifact, WalletProvider } from "./types";

const API = "https://walletobjects.googleapis.com/walletobjects/v1";
const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";

export function isGoogleConfigured(): boolean {
  const e = getEnv();
  return Boolean(e.GOOGLE_WALLET_ISSUER_ID && e.GOOGLE_WALLET_SA_EMAIL && e.GOOGLE_WALLET_SA_KEY_PEM);
}

export function googleClassId(shop: Pick<Shop, "id">, issuerId: string): string {
  return `${issuerId}.${shop.id}`;
}
export function googleObjectId(card: Pick<Card, "id">, issuerId: string): string {
  return `${issuerId}.${card.id}`;
}

export function buildLoyaltyClass(shop: Shop, issuerId: string, appUrl: string) {
  return {
    id: googleClassId(shop, issuerId),
    issuerName: "Perk",
    programName: shop.name,
    programLogo: { sourceUri: { uri: shop.logoUrl ?? `${appUrl}/pass/logo@3x.png` }, contentDescription: { defaultValue: { language: "en", value: `${shop.name} logo` } } },
    hexBackgroundColor: shop.brandColor,
    reviewStatus: "UNDER_REVIEW",
    countryCode: "US",
    multipleDevicesAndHoldersAllowedStatus: "ONE_USER_ALL_DEVICES",
  };
}

export function buildLoyaltyObject(shop: Shop, card: Card, issuerId: string, appUrl: string) {
  return {
    id: googleObjectId(card, issuerId),
    classId: googleClassId(shop, issuerId),
    state: "ACTIVE",
    accountId: card.shortCode,
    accountName: "Perk member",
    loyaltyPoints: { label: "Stamps", balance: { string: `${card.stamps} / ${shop.stampsRequired}` } },
    secondaryLoyaltyPoints: { label: "Rewards ready", balance: { int: card.rewardsAvailable } },
    barcode: { type: "QR_CODE", value: card.id, alternateText: card.shortCode },
    textModulesData: [{ id: "reward", header: "Reward", body: shop.rewardText }],
    linksModuleData: { uris: [{ id: "card", uri: `${appUrl}/${shop.slug}/card/${card.id}`, description: "Open my card" }] },
  };
}

/** Signed "Save to Google Wallet" JWT. Includes the class so demo-mode issuers work without a pre-created class. */
export async function buildSaveJwt(object: object, classObj: object | null, saEmail: string, privateKeyPem: string, origins: string[]): Promise<string> {
  const key = await importPKCS8(privateKeyPem, "RS256");
  const payload: Record<string, unknown> = { loyaltyObjects: [object] };
  if (classObj) payload.loyaltyClasses = [classObj];
  return new SignJWT({ typ: "savetowallet", origins, payload })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(saEmail)
    .setAudience("google")
    .setIssuedAt()
    .sign(key);
}

function client(): JWT {
  const e = getEnv();
  return new JWT({ email: e.GOOGLE_WALLET_SA_EMAIL, key: pemFromEnv(e.GOOGLE_WALLET_SA_KEY_PEM), scopes: [SCOPE] });
}

async function ensureClass(shop: Shop): Promise<string> {
  const e = getEnv();
  const issuerId = e.GOOGLE_WALLET_ISSUER_ID!;
  const id = googleClassId(shop, issuerId);
  if (shop.googleClassId === id) return id;
  const body = buildLoyaltyClass(shop, issuerId, e.NEXT_PUBLIC_APP_URL);
  if (!e.WALLET_DRY_RUN_BOOL) {
    const c = client();
    try {
      await c.request({ url: `${API}/loyaltyClass/${id}`, method: "GET" });
    } catch (err) {
      if ((err as { response?: { status?: number } }).response?.status === 404) {
        await c.request({ url: `${API}/loyaltyClass`, method: "POST", data: body });
      } else throw err;
    }
  }
  await setGoogleClassId(db, shop.id, id);
  return id;
}

/** PATCH the class after branding changes. */
export async function updateGoogleClass(shop: Shop): Promise<void> {
  const e = getEnv();
  if (!isGoogleConfigured() || !shop.googleClassId) return;
  const body = buildLoyaltyClass(shop, e.GOOGLE_WALLET_ISSUER_ID!, e.NEXT_PUBLIC_APP_URL);
  if (e.WALLET_DRY_RUN_BOOL) return console.log("[google] dry-run: would PATCH class", shop.googleClassId);
  await client().request({ url: `${API}/loyaltyClass/${shop.googleClassId}`, method: "PATCH", data: body });
}

export const googleWallet: WalletProvider = {
  async createPass(shop, card): Promise<PassArtifact> {
    const e = getEnv();
    if (!isGoogleConfigured()) throw new Error("Google Wallet is not configured");
    const issuerId = e.GOOGLE_WALLET_ISSUER_ID!;
    await ensureClass(shop);
    const object = buildLoyaltyObject(shop, card, issuerId, e.NEXT_PUBLIC_APP_URL);
    const classObj = buildLoyaltyClass(shop, issuerId, e.NEXT_PUBLIC_APP_URL);
    const jwt = await buildSaveJwt(object, classObj, e.GOOGLE_WALLET_SA_EMAIL!, pemFromEnv(e.GOOGLE_WALLET_SA_KEY_PEM)!, [e.NEXT_PUBLIC_APP_URL]);
    await setGoogleObjectId(db, shop.id, card.id, object.id);
    return { kind: "google", saveUrl: `https://pay.google.com/gp/v/save/${jwt}` };
  },
  async updatePass(shop, card) {
    const e = getEnv();
    if (!isGoogleConfigured() || !card.googleObjectId) return;
    const body = buildLoyaltyObject(shop, card, e.GOOGLE_WALLET_ISSUER_ID!, e.NEXT_PUBLIC_APP_URL);
    if (e.WALLET_DRY_RUN_BOOL) return console.log("[google] dry-run: would PATCH object", card.googleObjectId);
    try {
      await client().request({ url: `${API}/loyaltyObject/${card.googleObjectId}`, method: "PATCH", data: body });
    } catch (err) {
      if ((err as { response?: { status?: number } }).response?.status === 404) return; // never saved
      throw err;
    }
  },
};
