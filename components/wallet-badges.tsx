/* eslint-disable @next/next/no-img-element */
/**
 * Wallet CTAs. Google: the official "Add to Google Wallet" button asset (do not modify — brand guidelines).
 * Apple: still a placeholder drawn in the spirit of the official badge — swap in Apple's artwork from
 * developer.apple.com/wallet/add-to-apple-wallet-guidelines/ before launch (place at public/badges/apple-wallet-badge.svg).
 */
import { existsSync } from "node:fs";
import path from "node:path";

const OFFICIAL_APPLE_BADGE = existsSync(path.join(process.cwd(), "public", "badges", "apple-wallet-badge.svg"));

export function AppleWalletBadge({ className = "" }: { className?: string }) {
  if (OFFICIAL_APPLE_BADGE) {
    return <img src="/badges/apple-wallet-badge.svg" alt="" className={`block h-12 w-auto ${className}`} />;
  }
  return (
    <span className={`inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-4 text-white ${className}`}>
      <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden><rect x="1" y="1" width="24" height="18" rx="3" fill="#fff" opacity=".15" /><rect x="1" y="4" width="24" height="4" fill="#e5533d" /><rect x="1" y="8" width="24" height="4" fill="#f0a63c" /><rect x="1" y="12" width="24" height="7" rx="1" fill="#4aa3df" /></svg>
      <span className="leading-none"><span className="block text-[10px] opacity-80">Add to</span><span className="block text-[15px] font-semibold">Apple Wallet</span></span>
    </span>
  );
}

export function GoogleWalletBadge({ className = "" }: { className?: string }) {
  // Official asset; min height 48px, never restyled or recoloured.
  return <img src="/badges/google-wallet-button.svg" alt="" className={`block h-12 w-auto ${className}`} />;
}
