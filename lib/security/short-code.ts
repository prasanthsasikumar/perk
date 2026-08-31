import { randomInt } from "node:crypto";

/** No 0/O/1/I/L to avoid transcription errors at the counter. */
export const SHORT_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const SHORT_CODE_LENGTH = 8;

export function generateShortCode(): string {
  let out = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) out += SHORT_CODE_ALPHABET[randomInt(0, SHORT_CODE_ALPHABET.length)];
  return out;
}

/** Uppercase and strip spaces/dashes so "ab-cd 2345" matches "ABCD2345". */
export function normalizeShortCode(s: string): string {
  return s.toUpperCase().replace(/[\s-]+/g, "");
}

export function looksLikeShortCode(s: string): boolean {
  const n = normalizeShortCode(s);
  return n.length === SHORT_CODE_LENGTH && [...n].every((c) => SHORT_CODE_ALPHABET.includes(c));
}
