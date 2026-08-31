"use client";

import { useActionState, useState } from "react";
import { saveSettings, type SettingsState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Card, CardTitle } from "@/components/ui/card";
import { StampGrid } from "@/components/stamp-grid";

type ShopSettings = { name: string; brandColor: string; stampsRequired: number; rewardText: string; stampMode: "barista" | "customer"; customerScanCooldownMin: number; logoUrl: string | null };

export function SettingsForm({ shop }: { shop: ShopSettings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  const [color, setColor] = useState(shop.brandColor);
  const [stamps, setStamps] = useState(shop.stampsRequired);
  const [mode, setMode] = useState(shop.stampMode);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6">
      <Card className="space-y-5">
        <CardTitle>Shop &amp; branding</CardTitle>
        <Field label="Shop name" htmlFor="name" error={e.name}><Input id="name" name="name" defaultValue={shop.name} required /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Brand colour" htmlFor="brandColor" error={e.brandColor}>
            <div className="flex items-center gap-3">
              <input id="brandColor" name="brandColor" type="color" value={color} onChange={(ev) => setColor(ev.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-paper p-1" />
              <span className="font-mono text-sm text-ink-soft">{color}</span>
            </div>
          </Field>
          <Field label="Logo" htmlFor="logo" error={e.logo} hint={shop.logoUrl ? "Upload to replace the current logo." : "Square PNG or SVG."}>
            <div className="flex items-center gap-3">
              {shop.logoUrl && <img src={shop.logoUrl} alt="" className="h-11 w-11 rounded-lg border border-line bg-white object-contain" />}
              <input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent" />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="space-y-5">
        <CardTitle>Program</CardTitle>
        <Field label={`Stamps to earn a reward: ${stamps}`} htmlFor="stampsRequired" error={e.stampsRequired} hint="Lowering it clamps cards that are already past the new total.">
          <input id="stampsRequired" name="stampsRequired" type="range" min={3} max={30} value={stamps} onChange={(ev) => setStamps(Number(ev.target.value))} className="w-full accent-[var(--accent)]" />
        </Field>
        <StampGrid stamps={Math.min(3, stamps)} total={stamps} color={color} size="sm" />
        <Field label="Reward" htmlFor="rewardText" error={e.rewardText}><Input id="rewardText" name="rewardText" defaultValue={shop.rewardText} required /></Field>
      </Card>

      <Card className="space-y-5">
        <CardTitle>Stamping</CardTitle>
        <Field label="How stamps are added" htmlFor="stampMode" error={e.stampMode}>
          <Select id="stampMode" name="stampMode" value={mode} onChange={(ev) => setMode(ev.target.value as "barista" | "customer")}>
            <option value="barista">Baristas scan the customer&rsquo;s card</option>
            <option value="customer">Customers scan a QR at the counter</option>
          </Select>
        </Field>
        <Field label="Cooldown between customer self-stamps" htmlFor="customerScanCooldownMin" error={e.customerScanCooldownMin} hint={mode === "barista" ? "Only used in customer-scan mode." : undefined}>
          <Select id="customerScanCooldownMin" name="customerScanCooldownMin" defaultValue={shop.customerScanCooldownMin}>
            {[5, 10, 15, 30, 60, 120, 240].map((m) => <option key={m} value={m}>{m >= 60 ? `${m / 60} hour${m > 60 ? "s" : ""}` : `${m} minutes`}</option>)}
          </Select>
        </Field>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" loading={pending}>Save changes</Button>
        {state.ok && <p className="text-sm text-ok">Saved.</p>}
      </div>
    </form>
  );
}
