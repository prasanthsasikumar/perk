import { PKPass } from "passkit-generator";
import type { Card, Shop } from "@/lib/db/schema";
import { getEnv, pemFromEnv } from "@/lib/env";
import type { PassArtifact, WalletProvider } from "./types";
import { defaultAsset, shopLogoSet } from "./assets";
import { renderStripPng } from "./strip-image";
import { pushToCard } from "./apns";

export function hexToRgb(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return "rgb(31,31,31)";
  return `rgb(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)})`;
}

export type PassJsonOptions = { appUrl: string; passTypeId: string; teamId: string };

/** Pure pass.json builder — the part worth unit-testing. */
export function buildPassJson(shop: Shop, card: Card, { appUrl, passTypeId, teamId }: PassJsonOptions) {
  return {
    formatVersion: 1,
    passTypeIdentifier: passTypeId,
    teamIdentifier: teamId,
    serialNumber: card.id,
    organizationName: shop.name,
    description: `${shop.name} loyalty card`,
    logoText: shop.name,
    foregroundColor: "rgb(255,255,255)",
    backgroundColor: hexToRgb(shop.brandColor),
    labelColor: "rgb(255,255,255)",
    webServiceURL: `${appUrl}/api/wallet/apple`,
    authenticationToken: card.appleAuthToken,
    sharingProhibited: true,
    barcodes: [{ format: "PKBarcodeFormatQR", message: card.id, messageEncoding: "iso-8859-1", altText: card.shortCode }],
    storeCard: {
      primaryFields: [{ key: "stamps", label: "STAMPS", value: `${card.stamps} / ${shop.stampsRequired}` }],
      secondaryFields: [{ key: "reward", label: "REWARD", value: shop.rewardText }],
      auxiliaryFields: card.rewardsAvailable > 0 ? [{ key: "ready", label: "READY TO REDEEM", value: `${card.rewardsAvailable}` }] : [],
      backFields: [
        { key: "shop", label: "Shop", value: shop.name },
        { key: "code", label: "Card code", value: card.shortCode },
        { key: "link", label: "Open my card", value: `${appUrl}/${shop.slug}/card/${card.id}` },
        { key: "how", label: "How it works", value: `Collect ${shop.stampsRequired} stamps to earn: ${shop.rewardText}. Show this pass at the counter.` },
      ],
    },
  };
}

export function isAppleConfigured(): boolean {
  const e = getEnv();
  return Boolean(e.APPLE_TEAM_ID && e.APPLE_PASS_CERT_PEM && e.APPLE_PASS_KEY_PEM && e.APPLE_WWDR_PEM);
}

async function passFiles(shop: Shop, card: Card): Promise<Record<string, Buffer>> {
  const logos = await shopLogoSet(shop.logoUrl);
  const stripOpts = { stamps: card.stamps, total: shop.stampsRequired, color: shop.brandColor };
  return {
    "icon.png": defaultAsset("icon.png"),
    "icon@2x.png": defaultAsset("icon@2x.png"),
    "icon@3x.png": defaultAsset("icon@3x.png"),
    ...logos,
    "strip.png": await renderStripPng({ ...stripOpts, scale: 1 }),
    "strip@2x.png": await renderStripPng({ ...stripOpts, scale: 2 }),
    "strip@3x.png": await renderStripPng({ ...stripOpts, scale: 3 }),
  };
}

export async function buildApplePass(shop: Shop, card: Card): Promise<Buffer> {
  const env = getEnv();
  const json = buildPassJson(shop, card, { appUrl: env.NEXT_PUBLIC_APP_URL, passTypeId: env.APPLE_PASS_TYPE_ID, teamId: env.APPLE_TEAM_ID ?? "TEAMID" });
  if (env.WALLET_DRY_RUN_BOOL || !isAppleConfigured()) {
    // Dry run: return the unsigned pass.json so callers/tests can inspect it.
    return Buffer.from(JSON.stringify(json, null, 2));
  }
  const files = await passFiles(shop, card);
  const pass = new PKPass(
    { "pass.json": Buffer.from(JSON.stringify(json)), ...files },
    {
      wwdr: pemFromEnv(env.APPLE_WWDR_PEM)!,
      signerCert: pemFromEnv(env.APPLE_PASS_CERT_PEM)!,
      signerKey: pemFromEnv(env.APPLE_PASS_KEY_PEM)!,
      signerKeyPassphrase: env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    },
  );
  return pass.getAsBuffer();
}

export const appleWallet: WalletProvider = {
  async createPass(shop, card): Promise<PassArtifact> {
    return { kind: "apple", buffer: await buildApplePass(shop, card), contentType: "application/vnd.apple.pkpass" };
  },
  async updatePass(_shop, card) {
    await pushToCard(card.id);
  },
};
