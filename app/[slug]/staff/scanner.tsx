"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { leaveStaffMode, staffLookup, staffRedeem, staffStamp, type ActionResult } from "./actions";
import type { CardView } from "@/lib/staff/card-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StampGrid } from "@/components/stamp-grid";

type Toast = { tone: "ok" | "warn" | "info"; text: string } | null;

export function Scanner({ slug, brandColor }: { slug: string; brandColor: string }) {
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
    if (verb === "stamp") setToast(r.duplicate ? { tone: "warn", text: "Already stamped a moment ago" } : r.rewardEarned ? { tone: "ok", text: "Reward earned! 🎉" } : { tone: "ok", text: "Stamped!" });
    if (verb === "redeem") setToast({ tone: "ok", text: "Reward redeemed" });
  }, []);

  const lookup = useCallback((value: string) => {
    start(async () => handle(await staffLookup(slug, value), "lookup"));
  }, [slug, handle]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const reset = () => { setCard(null); setCode(""); setError(null); setScanning(true); };

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
          <div className="mt-4"><StampGrid stamps={card.stamps} total={card.stampsRequired} color={brandColor} /></div>
          {card.rewardsAvailable > 0 && <p className="mt-4 rounded-xl bg-accent-soft px-3 py-2 text-sm font-medium text-accent">{card.rewardsAvailable} reward{card.rewardsAvailable > 1 ? "s" : ""} ready to redeem</p>}
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button size="lg" loading={pending} onClick={() => start(async () => handle(await staffStamp(slug, card.id), "stamp"))}>+1 stamp</Button>
            <Button size="lg" variant="secondary" disabled={card.rewardsAvailable === 0 || pending} onClick={() => { if (confirm("Redeem one reward for this customer?")) start(async () => handle(await staffRedeem(slug, card.id), "redeem")); }}>Redeem</Button>
          </div>
          <Button variant="ghost" className="mt-3 w-full" onClick={reset}>Scan next</Button>
        </section>
      ) : (
        <>
          {scanning && <CameraReader onDecode={(v) => { setScanning(false); lookup(v); }} onUnavailable={() => setScanning(false)} />}
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (code.trim()) lookup(code); }}>
            <label htmlFor="code" className="block text-sm font-medium text-ink-soft">Card code</label>
            <div className="flex gap-2">
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCD-2345" autoCapitalize="characters" autoCorrect="off" className="font-mono uppercase tracking-widest" aria-label="Card code" />
              <Button type="submit" variant="secondary" loading={pending} className="shrink-0">Look up</Button>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            {!scanning && <button type="button" className="text-sm text-accent underline" onClick={() => setScanning(true)}>Use camera</button>}
          </form>
        </>
      )}

      <form action={leaveStaffMode.bind(null, slug)} className="pt-6 text-center">
        <button type="submit" className="text-xs text-ink-muted underline">Leave staff mode on this device</button>
      </form>
    </div>
  );
}

function CameraReader({ onDecode, onUnavailable }: { onDecode: (value: string) => void; onUnavailable: () => void }) {
  const id = "perk-reader";
  const [msg, setMsg] = useState<string | null>(null);
  const decoded = useRef(false);

  useEffect(() => {
    let stop: (() => Promise<void>) | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const reader = new Html5Qrcode(id, { verbose: false });
        await reader.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) },
          (text) => {
            if (decoded.current) return;
            decoded.current = true;
            onDecode(text);
            void reader.stop().catch(() => {});
          },
          () => {},
        );
        stop = async () => { try { await reader.stop(); reader.clear(); } catch { /* already stopped */ } };
        if (cancelled) await stop();
      } catch (e) {
        console.warn("[scanner] camera unavailable", e);
        setMsg("Camera not available — type the card code below.");
        onUnavailable();
      }
    })();
    return () => { cancelled = true; void stop?.(); };
  }, [onDecode, onUnavailable]);

  return (
    <div className="space-y-2">
      <div id={id} className="overflow-hidden rounded-3xl bg-black [&_video]:!w-full" style={{ minHeight: 260 }} />
      <p className="text-center text-xs text-ink-muted">{msg ?? "Point the camera at the customer's pass"}</p>
    </div>
  );
}
