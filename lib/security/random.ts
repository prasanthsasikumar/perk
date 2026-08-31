import { randomBytes, randomInt } from "node:crypto";

/** URL-safe random token. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** 6-digit numeric PIN, zero-padded. */
export function randomPin(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
