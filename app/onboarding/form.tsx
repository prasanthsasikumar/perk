"use client";

import { useActionState, useMemo, useState } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { StampGrid } from "@/components/stamp-grid";
import { LogoInput } from "@/components/logo-input";
import { slugify } from "@/lib/slug";

export function OnboardingForm({ appHost }: { appHost: string }) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(completeOnboarding, {});
  const v = state.values ?? {};
  const [name, setName] = useState(v.name ?? "");
  const [manualSlug, setManualSlug] = useState(v.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(v.slug));
  const slug = slugTouched ? manualSlug : slugify(name);
  const [color, setColor] = useState(v.brandColor ?? "#c96a2b");
  const [stamps, setStamps] = useState(Number(v.stampsRequired ?? 10));
  const [reward, setReward] = useState(v.rewardText ?? "Free coffee of your choice");
  const [mode, setMode] = useState<"barista" | "customer">((v.stampMode as "barista" | "customer") ?? "barista");
  const [cooldown, setCooldown] = useState(Number(v.customerScanCooldownMin ?? 15));
  const e = state.errors ?? {};

  const preview = useMemo(() => Math.min(3, stamps), [stamps]);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <Card className="space-y-5">
          <h2 className="text-lg font-semibold">Your shop</h2>
          <Field label="Shop name" htmlFor="name" error={e.name}>
            <Input id="name" name="name" value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Blue Bottle Coffee" required invalid={!!e.name} />
          </Field>
          <Field label="Your URL" htmlFor="slug" error={e.slug} hint="Customers open this link (or scan its QR) to get their card. It can't be changed later.">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-ink-muted">{appHost}/</span>
              <Input id="slug" name="slug" value={slug} onChange={(ev) => { setSlugTouched(true); setManualSlug(ev.target.value.toLowerCase()); }} placeholder="blue-bottle" required invalid={!!e.slug} className="font-mono" />
            </div>
          </Field>
          <Field label="Logo (optional)" htmlFor="logo" error={e.logo} hint="Square PNG or SVG works best. Shown on the wallet pass.">
            <LogoInput />
          </Field>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-lg font-semibold">The card</h2>
          <Field label={`Stamps to earn a reward: ${stamps}`} htmlFor="stampsRequired" error={e.stampsRequired}>
            <input id="stampsRequired" name="stampsRequired" type="range" min={3} max={30} value={stamps} onChange={(ev) => setStamps(Number(ev.target.value))} className="w-full accent-[var(--accent)]" />
          </Field>
          <Field label="Reward" htmlFor="rewardText" error={e.rewardText}>
            <Input id="rewardText" name="rewardText" value={reward} onChange={(ev) => setReward(ev.target.value)} required invalid={!!e.rewardText} />
          </Field>
          <Field label="Brand colour" htmlFor="brandColor" error={e.brandColor}>
            <div className="flex items-center gap-3">
              <input id="brandColor" name="brandColor" type="color" value={color} onChange={(ev) => setColor(ev.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-paper p-1" />
              <span className="font-mono text-sm text-ink-soft">{color}</span>
            </div>
          </Field>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-lg font-semibold">How stamps are added</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModeOption name="stampMode" value="barista" checked={mode === "barista"} onChange={() => setMode("barista")} title="Baristas scan the card" body="Your staff scan the customer's pass with any phone. Most secure." />
            <ModeOption name="stampMode" value="customer" checked={mode === "customer"} onChange={() => setMode("customer")} title="Customers scan a QR" body="Print a QR for the counter. Customers scan it after buying; one stamp per cooldown." />
          </div>
          {mode === "customer" && (
            <Field label="Cooldown between self-stamps" htmlFor="customerScanCooldownMin" error={e.customerScanCooldownMin}>
              <Select id="customerScanCooldownMin" name="customerScanCooldownMin" value={cooldown} onChange={(ev) => setCooldown(Number(ev.target.value))}>
                {[5, 10, 15, 30, 60, 120, 240].map((m) => (
                  <option key={m} value={m}>{m >= 60 ? `${m / 60} hour${m > 60 ? "s" : ""}` : `${m} minutes`}</option>
                ))}
              </Select>
            </Field>
          )}
          {mode === "barista" && <input type="hidden" name="customerScanCooldownMin" value={cooldown} />}
        </Card>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">You can edit everything except the URL in Settings.</p>
          <Button type="submit" size="lg" loading={pending}>Create my card</Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-3 text-sm font-medium text-ink-soft">Preview</p>
        <div className="rounded-3xl p-5 text-white shadow-xl" style={{ background: color }}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{name || "Your shop"}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">Perk</span>
          </div>
          <div className="mt-6 rounded-2xl bg-white p-4 text-ink">
            <StampGrid stamps={preview} total={stamps} color={color} size="sm" />
            <p className="mt-3 text-xs text-ink-soft">{preview} / {stamps} stamps · {reward || "Reward"}</p>
          </div>
          <p className="mt-4 text-xs text-white/80">{appHost}/{slug || "your-shop"}</p>
        </div>
      </aside>
    </form>
  );
}

function ModeOption({ name, value, checked, onChange, title, body }: { name: string; value: string; checked: boolean; onChange: () => void; title: string; body: string }) {
  return (
    <label className={`cursor-pointer rounded-2xl border p-4 transition-colors ${checked ? "border-accent bg-accent-soft/50" : "border-line hover:bg-black/[0.02]"}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-sm text-ink-soft">{body}</span>
    </label>
  );
}
