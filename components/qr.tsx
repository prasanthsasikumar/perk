"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Renders a QR code as an <img> (data URL), generated client-side. */
export function Qr({ value, size = 200, className = "", label }: { value: string; size?: number; className?: string; label?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: "M", color: { dark: "#1c1917", light: "#ffffff" } }).then((u) => alive && setSrc(u));
    return () => { alive = false; };
  }, [value, size]);
  return (
    <div className={`inline-flex items-center justify-center rounded-2xl bg-white p-3 ${className}`} style={{ width: size + 24, height: size + 24 }}>
      {src ? <img src={src} width={size} height={size} alt={label ?? "QR code"} className="block" /> : <span className="text-xs text-ink-muted">…</span>}
    </div>
  );
}
