"use client";

import { useActionState, useState } from "react";
import { saveSettings, type SettingsState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Card, CardTitle } from "@/components/ui/card";
import { StampGrid } from "@/components/stamp-grid";
import { LogoInput } from "@/components/logo-input";
import { STAMP_STYLES, type RewardTier, type StampStyle } from "@/lib/db/schema";
import { STAMP_STYLE_LABELS } from "@/lib/stamp-icons";
import { MAX_BONUS_TIERS } from "@/lib/validation/shop";

type ShopSettings = {
  name: string;
  brandColor: string;
  stampsRequired: number;
  rewardText: string;
  rewardTiers: RewardTier[];
  stampStyle: StampStyle;
  stampMode: "barista" | "customer";
  customerScanCooldownMin: number;
  logoUrl: string | null;
};

export function SettingsForm({ shop }: { shop: ShopSettings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  const [color, setColor] = useState(shop.brandColor);
  const [stamps, setStamps] = useState(shop.stampsRequired);
  const [reward, setReward] = useState(shop.rewardText);
  const [tiers, setTiers] = useState<RewardTier[]>(shop.rewardTiers);
  const [style, setStyle] = useState<StampStyle>(shop.stampStyle);
  const [mode, setMode] = useState(shop.stampMode);
  const e = state.errors ?? {};
  const milestones = tiers.map((t) => t.stamps).filter((n) => n > 0 && n < stamps);

  const updateTier = (i: number, patch: Partial<RewardTier>) => setTiers((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const addTier = () => setTiers((ts) => [...ts, { stamps: Math.max(1, Math.floor(stamps / 2)), reward: "Free coffee" }]);
  const removeTier = (i: number) => setTiers((ts) => ts.filter((_, j) => j !== i));

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {shop.logoUrl && <img src={shop.logoUrl} alt="" className="h-11 w-11 rounded-lg border border-line bg-white object-contain" />}
              <LogoInput />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="space-y-5">
        <CardTitle>Program</CardTitle>
        <Field label={`Stamps on the card: ${stamps}`} htmlFor="stampsRequired" error={e.stampsRequired} hint="Raising it keeps everyone's progress. Lowering it clamps cards that are already past the new total.">
          <input id="stampsRequired" name="stampsRequired" type="range" min={3} max={30} value={stamps} onChange={(ev) => setStamps(Number(ev.target.value))} className="w-full accent-[var(--accent)]" />
        </Field>
        <StampGrid stamps={Math.min(3, stamps)} total={stamps} color={color} size="sm" style={style} milestones={milestones} />
        <Field label={`Reward at ${stamps} stamps`} htmlFor="rewardText" error={e.rewardText} hint="The card resets once this is earned.">
          <Input id="rewardText" name="rewardText" value={reward} onChange={(ev) => setReward(ev.target.value)} required />
        </Field>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-ink-soft">Bonus rewards along the way</p>
            <p className="text-sm text-ink-muted">Optional. For example a free coffee at 5 stamps on a 10-stamp card that ends with a gelato. The card keeps counting after a bonus.</p>
          </div>
          <input type="hidden" name="rewardTiers" value={JSON.stringify(tiers)} />
          {tiers.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-cream/60 p-3 sm:flex-nowrap">
              <span className="text-sm text-ink-soft">At</span>
              <Select aria-label="Stamps for this bonus" value={t.stamps} onChange={(ev) => updateTier(i, { stamps: Number(ev.target.value) })} className="w-24 shrink-0">
                {Array.from({ length: stamps - 1 }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
              <span className="text-sm text-ink-soft">stamps:</span>
              <Input aria-label="Bonus reward" value={t.reward} onChange={(ev) => updateTier(i, { reward: ev.target.value })} placeholder="Free coffee" className="min-w-40 flex-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeTier(i)} aria-label="Remove bonus reward">Remove</Button>
            </div>
          ))}
          {e.rewardTiers && <p className="text-sm text-danger">{e.rewardTiers}</p>}
          {tiers.length < MAX_BONUS_TIERS && (
            <Button type="button" variant="secondary" size="sm" onClick={addTier}>+ Add a bonus reward</Button>
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Card template</CardTitle>
        <p className="text-sm text-ink-muted">How filled stamps look on the web card, the staff scanner and the Apple Wallet pass.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAMP_STYLES.map((s) => (
            <label key={s} className={`cursor-pointer rounded-2xl border p-3 transition-colors ${style === s ? "border-accent bg-accent-soft/50" : "border-line hover:bg-black/[0.02]"}`}>
              <input type="radio" name="stampStyle" value={s} checked={style === s} onChange={() => setStyle(s)} className="sr-only" />
              <StampGrid stamps={2} total={3} color={color} size="sm" style={s} />
              <span className="mt-2 block text-sm font-medium">{STAMP_STYLE_LABELS[s]}</span>
            </label>
          ))}
        </div>
        {e.stampStyle && <p className="text-sm text-danger">{e.stampStyle}</p>}
      </Card>

      <Card className="space-y-5">
        <CardTitle>Stamping</CardTitle>
        <Field label="How stamps are added" htmlFor="stampMode" error={e.stampMode}>
          <Select id="stampMode" name="stampMode" value={mode} onChange={(ev) => setMode(ev.target.value as "barista" | "customer")}>
            <option value="barista">Baristas scan the customer&rsquo;s card (recommended)</option>
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
