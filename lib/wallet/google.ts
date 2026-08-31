import type { WalletProvider } from "./types";

export const googleWallet: WalletProvider = {
  async createPass() { throw new Error("Google Wallet not implemented yet"); },
  async updatePass() {},
};
