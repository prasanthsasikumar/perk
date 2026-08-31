import type { Card, Shop } from "@/lib/db/schema";

export type PassArtifact =
  | { kind: "apple"; buffer: Buffer; contentType: "application/vnd.apple.pkpass" }
  | { kind: "google"; saveUrl: string };

export interface WalletProvider {
  /** Build (and for Google, register) a pass for this card. */
  createPass(shop: Shop, card: Card): Promise<PassArtifact>;
  /** Push the card's current state to wallets that hold it. Must not throw on transport failures. */
  updatePass(shop: Shop, card: Card): Promise<void>;
}
