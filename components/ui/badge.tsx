import * as React from "react";

type Tone = "neutral" | "accent" | "ok" | "danger";
const tones: Record<Tone, string> = {
  neutral: "bg-black/5 text-ink-soft",
  accent: "bg-accent-soft text-accent",
  ok: "bg-green-50 text-ok",
  danger: "bg-red-50 text-danger",
};

export function Badge({ tone = "neutral", children, className = "" }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
}
