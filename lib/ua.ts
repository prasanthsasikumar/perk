export type Platform = "ios" | "android" | "other";

export function detectPlatform(ua: string | null | undefined): Platform {
  if (!ua) return "other";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  // iPadOS 13+ reports as Macintosh; treat touch Macs as iOS only if "Mobile" hints exist.
  if (/Macintosh/.test(ua) && /Mobile/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}
