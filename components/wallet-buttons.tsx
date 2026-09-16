import type { Platform } from "@/lib/ua";
import { AppleWalletBadge, GoogleWalletBadge } from "./wallet-badges";

type Action = (formData: FormData) => void | Promise<void>;

/**
 * Wallet CTAs, ordered for the visitor's platform. Each is a form so the server action can create the card,
 * set the cookie, and redirect to the pass in one round-trip.
 * `layout="stack"` renders one full-width row per option (shop landing page); "row" wraps them inline.
 */
export function WalletButtons({ platform, onApple, onGoogle, onWeb, compact = false, layout = "row" }: { platform: Platform; onApple: Action; onGoogle: Action; onWeb?: Action; compact?: boolean; layout?: "row" | "stack" }) {
  const stack = layout === "stack";
  const badgeHeight = stack ? 54 : 48;
  const apple = (
    <form action={onApple} key="apple" className={stack ? "flex justify-center" : undefined}>
      <button type="submit" className="block transition-transform active:scale-[0.98]" aria-label="Add to Apple Wallet"><AppleWalletBadge height={badgeHeight} /></button>
    </form>
  );
  const google = (
    <form action={onGoogle} key="google" className={stack ? "flex justify-center" : undefined}>
      <button type="submit" className="block transition-transform active:scale-[0.98]" aria-label="Add to Google Wallet"><GoogleWalletBadge height={badgeHeight} /></button>
    </form>
  );
  const web = onWeb ? (
    <form action={onWeb} key="web">
      <button
        type="submit"
        className={
          stack
            ? "flex h-[54px] w-full items-center justify-center rounded-[14px] border border-[rgba(26,23,32,0.14)] bg-white text-[15.5px] font-semibold text-[#1A1720] transition-colors hover:border-[rgba(26,23,32,0.26)] hover:bg-[#FBFAF8]"
            : "inline-flex h-12 items-center rounded-lg border border-line bg-paper px-4 text-[15px] font-medium text-ink hover:bg-accent-soft/50"
        }
      >
        Save as web card
      </button>
    </form>
  ) : null;

  // Primary wallet for the platform first. Stacked: wallets together, web card last; inline: web card next to the primary wallet.
  const [primary, secondary] = platform === "android" ? [google, apple] : [apple, google];
  const order = stack ? [primary, compact ? null : secondary, web] : platform === "ios" || platform === "android" ? [primary, web, compact ? null : secondary] : [apple, google, web];
  return <div className={stack ? "flex flex-col gap-2.5" : "flex flex-wrap items-center gap-3"}>{order}</div>;
}
