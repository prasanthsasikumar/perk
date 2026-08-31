import type { Platform } from "@/lib/ua";
import { AppleWalletBadge, GoogleWalletBadge } from "./wallet-badges";

type Action = (formData: FormData) => void | Promise<void>;

/**
 * Wallet CTAs, ordered for the visitor's platform. Each is a form so the server action can create the card,
 * set the cookie, and redirect to the pass in one round-trip.
 */
export function WalletButtons({ platform, onApple, onGoogle, onWeb, compact = false }: { platform: Platform; onApple: Action; onGoogle: Action; onWeb?: Action; compact?: boolean }) {
  const apple = (
    <form action={onApple} key="apple">
      <button type="submit" className="block transition-transform active:scale-[0.98]" aria-label="Add to Apple Wallet"><AppleWalletBadge /></button>
    </form>
  );
  const google = (
    <form action={onGoogle} key="google">
      <button type="submit" className="block transition-transform active:scale-[0.98]" aria-label="Add to Google Wallet"><GoogleWalletBadge /></button>
    </form>
  );
  const web = onWeb ? (
    <form action={onWeb} key="web">
      <button type="submit" className="inline-flex h-12 items-center rounded-lg border border-line bg-paper px-4 text-[15px] font-medium text-ink hover:bg-accent-soft/50">Save as web card</button>
    </form>
  ) : null;

  const order = platform === "ios" ? [apple, web, compact ? null : google] : platform === "android" ? [google, web, compact ? null : apple] : [apple, google, web];
  return <div className="flex flex-wrap items-center gap-3">{order}</div>;
}
