"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { leaveStaffMode, staffLookup, staffRedeem, staffStamp, type ActionResult } from "./actions";
import type { CardView } from "@/lib/staff/card-view";
import type { StampStyle } from "@/lib/db/schema";
import { countRewards } from "@/lib/domain/tiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StampGrid } from "@/components/stamp-grid";

type Toast = { tone: "ok" | "warn" | "info"; text: string } | null;

export function Scanner({ slug, brandColor, stampStyle }: { slug: string; brandColor: string; stampStyle: StampStyle }) {
  const [card, setCard] = useState<CardView | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [scanning, setScanning] = useState(true);

  const handle = useCallback((r: ActionResult, verb: "lookup" | "stamp" | "redeem") => {
    if ("error" in r) { setError(r.error); return; }
    setError(null);
    setCard(r);
    if (verb === "stamp") {
      if (r.duplicate) setToast({ tone: "warn", text: "Already stamped a moment ago" });
      else if (r.rewardEarned) setToast({ tone: "ok", text: `Reward earned: ${r.rewardsEarned?.[0] ?? "reward"} 🎉` });
      else setToast({ tone: "ok", text: "Stamped!" });
    }
    if (verb === "redeem") setToast({ tone: "ok", text: r.redeemed ? `Redeemed: ${r.redeemed}` : "Reward redeemed" });
  }, []);

  const lookup = useCallback((value: string) => {
    start(async () => handle(await staffLookup(slug, value), "lookup"));
  }, [slug, handle]);

  const onDecode = useCallback((value: string) => { setScanning(false); lookup(value); }, [lookup]);
  const onUnavailable = useCallback(() => setScanning(false), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const reset = () => { setCard(null); setCode(""); setError(null); setScanning(true); };

  const redeem = (reward: string) => {
    if (confirm(`Redeem "${reward}" for this customer?`)) start(async () => handle(await staffRedeem(slug, card!.id, reward), "redeem"));
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div role="status" className={`rounded-2xl px-4 py-3 text-center font-medium ${toast.tone === "ok" ? "bg-green-50 text-ok" : toast.tone === "warn" ? "bg-amber-50 text-amber-800" : "bg-black/5 text-ink"}`}>{toast.text}</div>
      )}

      {card ? (
        <section className="rounded-3xl border border-line bg-paper p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-lg tracking-[0.2em]">{card.shortCode.slice(0, 4)}-{card.shortCode.slice(4)}</p>
              <p className="text-sm text-ink-soft">{card.lastStampedAt ? `Last stamp ${new Date(card.lastStampedAt).toLocaleString()}` : "New card"}</p>
            </div>
            <p className="text-3xl font-semibold">{card.stamps}<span className="text-base text-ink-muted"> / {card.stampsRequired}</span></p>
          </div>
          <div className="mt-4"><StampGrid stamps={card.stamps} total={card.stampsRequired} color={brandColor} style={stampStyle} milestones={card.milestones} /></div>
          {card.tiers.length > 1 && (
            <p className="mt-2 text-xs text-ink-muted">{card.tiers.map((t) => `${t.stamps}: ${t.reward}`).join(" · ")}</p>
          )}
          {card.rewardsAvailable > 0 && (
            <p className="mt-4 rounded-xl bg-accent-soft px-3 py-2 text-sm font-medium text-accent">
              Ready to redeem: {countRewards(card.pendingRewards).map((r) => (r.count > 1 ? `${r.reward} ×${r.count}` : r.reward)).join(" · ")}
            </p>
          )}
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <div className="mt-5 grid gap-3">
            <Button size="lg" loading={pending} onClick={() => start(async () => handle(await staffStamp(slug, card.id), "stamp"))}>+1 stamp</Button>
            {card.rewardsAvailable === 0 ? (
              <Button size="lg" variant="secondary" disabled>Redeem</Button>
            ) : (
              countRewards(card.pendingRewards).map((r) => (
                <Button key={r.reward} size="lg" variant="secondary" disabled={pending} onClick={() => redeem(r.reward)}>
                  Redeem {r.reward}{r.count > 1 ? ` (${r.count} banked)` : ""}
                </Button>
              ))
            )}
          </div>
          <Button variant="ghost" className="mt-3 w-full" onClick={reset}>Scan next</Button>
        </section>
      ) : (
        <>
          {scanning && <CameraReader onDecode={onDecode} onUnavailable={onUnavailable} />}
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (code.trim()) lookup(code); }}>
            <label htmlFor="code" className="block text-sm font-medium text-ink-soft">Card code</label>
            <div className="flex gap-2">
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCD-2345" autoCapitalize="characters" autoCorrect="off" className="font-mono uppercase tracking-widest" aria-label="Card code" />
              <Button type="submit" variant="secondary" loading={pending} className="shrink-0">Look up</Button>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
          </form>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            {!scanning && <button type="button" className="text-accent underline" onClick={() => setScanning(true)}>Use camera</button>}
            <PhotoReader onDecode={onDecode} />
          </div>
        </>
      )}

      <form action={leaveStaffMode.bind(null, slug)} className="pt-6 text-center">
        <button type="submit" className="text-xs text-ink-muted underline">Leave staff mode on this device</button>
      </form>
    </div>
  );
}

/** Scanner config: the bundled ZXing decoder is used on every browser. The native BarcodeDetector
 *  API exists but never returns a result on some browsers (Brave and de-Googled Android builds),
 *  which shows a live preview that silently never scans. */
const READER_CONFIG = { verbose: false, useBarCodeDetectorIfSupported: false } as const;

function isBrave(): boolean {
  const nav = navigator as Navigator & { brave?: unknown };
  return typeof nav.brave === "object" && nav.brave !== null;
}

/** Turn a getUserMedia failure into something the barista can act on. */
export function cameraHelp(err: unknown): string {
  const name = typeof err === "object" && err !== null && "name" in err ? String((err as { name: unknown }).name) : "";
  const msg = String(err ?? "").toLowerCase();
  let base: string;
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || msg.includes("permission")) base = "Camera access was blocked. Allow the camera for this site in your browser settings, then tap Retry.";
  else if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") base = "No usable camera was found on this device.";
  else if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") base = "The camera is busy in another app or tab. Close it and tap Retry.";
  else if (name === "SecurityError" || msg.includes("secure")) base = "The camera only works on a secure (https) page.";
  else base = "The camera couldn't start.";
  if (typeof navigator !== "undefined" && isBrave()) {
    base += " In Brave, tap the lion (Shields) icon in the address bar and turn Shields down for this site — its fingerprinting protection blocks the camera — then reload.";
  }
  return base;
}

function CameraReader({ onDecode, onUnavailable }: { onDecode: (value: string) => void; onUnavailable: () => void }) {
  const id = "perk-reader";
  const [msg, setMsg] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Keep the latest callbacks in refs so the camera is started once per mount, not on every parent render.
  const decodeRef = useRef(onDecode);
  const unavailableRef = useRef(onUnavailable);
  useEffect(() => { decodeRef.current = onDecode; unavailableRef.current = onUnavailable; });

  useEffect(() => {
    let stop: (() => Promise<void>) | null = null;
    let cancelled = false;
    let decoded = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const reader = new Html5Qrcode(id, READER_CONFIG);
        const scanConfig = { fps: 10, qrbox: (w: number, h: number) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) };
        const onScan = (text: string) => {
          if (decoded) return;
          decoded = true;
          decodeRef.current(text);
          void reader.stop().catch(() => {});
        };
        try {
          await reader.start({ facingMode: "environment" }, scanConfig, onScan, () => {});
        } catch (first) {
          // Some Android builds reject facingMode constraints; fall back to an explicit device id.
          const cams = await Html5Qrcode.getCameras().catch(() => []);
          if (!cams.length) throw first;
          const rear = cams.find((c) => /back|rear|environment/i.test(c.label)) ?? cams[cams.length - 1];
          await reader.start(rear.id, scanConfig, onScan, () => {});
        }
        stop = async () => { try { await reader.stop(); reader.clear(); } catch { /* already stopped */ } };
        if (cancelled) await stop();
      } catch (e) {
        console.warn("[scanner] camera unavailable", e);
        if (!cancelled) { setMsg(cameraHelp(e)); unavailableRef.current(); }
      }
    })();
    return () => { cancelled = true; void stop?.(); };
  }, [attempt]);

  return (
    <div className="space-y-2">
      <div id={id} className="overflow-hidden rounded-3xl bg-black [&_video]:!w-full" style={{ minHeight: msg ? 0 : 260 }} />
      {msg ? (
        <div className="rounded-2xl border border-line bg-paper p-4 text-sm text-ink-soft">
          <p>{msg}</p>
          <button type="button" className="mt-2 text-accent underline" onClick={() => { setMsg(null); setAttempt((n) => n + 1); }}>Retry camera</button>
        </div>
      ) : (
        <p className="text-center text-xs text-ink-muted">Point the camera at the customer&rsquo;s pass</p>
      )}
    </div>
  );
}

/** Decode a QR from a photo taken with the native camera app. Works even when the browser blocks live camera access. */
function PhotoReader({ onDecode }: { onDecode: (value: string) => void }) {
  const id = "perk-photo-reader";
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true); setErr(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const reader = new Html5Qrcode(id, READER_CONFIG);
      try {
        onDecode(await reader.scanFile(file, false));
      } finally {
        reader.clear();
      }
    } catch (e) {
      console.warn("[scanner] photo decode failed", e);
      setErr("Couldn't read a QR code in that photo. Get closer and try again, or type the card code.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <div id={id} className="hidden" />
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take a photo of the pass" onChange={(e) => void onFile(e.target.files?.[0])} />
      <button type="button" className="text-accent underline disabled:opacity-50" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? "Reading photo…" : "Take a photo of the pass"}</button>
      {err && <p className="basis-full text-center text-sm text-danger">{err}</p>}
    </>
  );
}
