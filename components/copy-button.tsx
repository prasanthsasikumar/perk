"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* ignore */ } }}
      className="inline-flex h-8 items-center rounded-full border border-line bg-paper px-3 text-xs font-medium text-ink-soft hover:bg-accent-soft/60"
    >
      {done ? "Copied" : label}
    </button>
  );
}
