import { requireShop } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { Card, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./form";
import { rotatePin, rotateQr } from "./actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { shop } = await requireShop();
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-ink-soft">Changes apply to every card immediately; wallet passes refresh on their own.</p>
      </div>

      <Card>
        <CardTitle>Your URL</CardTitle>
        <p className="mt-1 font-mono text-ink">{appUrl}/{shop.slug}</p>
        <p className="mt-1 text-sm text-ink-muted">Fixed once created — it&rsquo;s printed on your posters.</p>
      </Card>

      <SettingsForm shop={{ name: shop.name, brandColor: shop.brandColor, stampsRequired: shop.stampsRequired, rewardText: shop.rewardText, stampMode: shop.stampMode, customerScanCooldownMin: shop.customerScanCooldownMin, logoUrl: shop.logoUrl }} />

      <Card className="space-y-4">
        <CardTitle>Staff access</CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink-soft">Staff PIN for <span className="font-mono">{appUrl}/{shop.slug}/staff</span></p>
            <p className="font-mono text-2xl tracking-[0.3em]">{shop.staffPin}</p>
          </div>
          <form action={rotatePin}>
            <Button type="submit" variant="secondary">Rotate PIN</Button>
          </form>
        </div>
        <p className="text-xs text-ink-muted">Rotating signs out every staff device. Share the new PIN with your team.</p>
      </Card>

      {shop.stampMode === "customer" && (
        <Card className="space-y-3">
          <CardTitle>Stamp QR</CardTitle>
          <p className="text-sm text-ink-soft">If a “Scan to stamp” poster leaks online, rotate it. Old posters stop working immediately; reprint from the Print page.</p>
          <form action={rotateQr}>
            <Button type="submit" variant="danger">Rotate stamp QR</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
