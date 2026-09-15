import type { StampStyle } from "@/lib/db/schema";

/** Icon drawn inside a filled stamp cell, in a 24×24 box. Shared by the web grid and the Apple strip. */
export type IconPath = { d: string; kind: "fill" | "stroke" };

export const STAMP_ICONS: Record<StampStyle, IconPath[]> = {
  check: [{ d: "M6 12.5l3.5 3.5L18 8", kind: "stroke" }],
  star: [{ d: "M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4L12 17.4l-5.7 3 1.1-6.4L2.8 9.5l6.4-.9z", kind: "fill" }],
  heart: [{ d: "M12 20.6S3.6 15.6 3.6 9.6C3.6 6.9 5.7 5 8.1 5c1.7 0 3.1.9 3.9 2.3C12.8 5.9 14.2 5 15.9 5c2.4 0 4.5 1.9 4.5 4.6 0 6-8.4 11-8.4 11z", kind: "fill" }],
  cup: [
    { d: "M4.5 7h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V7z", kind: "fill" },
    { d: "M16.5 9h1.3a2.6 2.6 0 0 1 0 5.2h-1.3M6 20.5h9", kind: "stroke" },
  ],
};

export const STAMP_STYLE_LABELS: Record<StampStyle, string> = { check: "Classic tick", star: "Stars", heart: "Hearts", cup: "Coffee cups" };
