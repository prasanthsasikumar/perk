/* eslint-disable @next/next/no-img-element */
/**
 * Wallet CTAs using the official badge artwork, unaltered (Apple: Add to Apple Wallet Guidelines and
 * Wallet Marketing Artwork License; Google: Wallet brand guidelines, "badge" variant from the official
 * asset pack). Both scale proportionally from `height`; 48px is the shared minimum. Apple's badge is
 * 111×35 and Google's 199×55, so at one height they come out a similar width.
 */
type BadgeProps = { className?: string; height?: number };

export function AppleWalletBadge({ className = "", height = 48 }: BadgeProps) {
  return <img src="/badges/apple-wallet-badge.svg" alt="" style={{ height }} className={`block w-auto ${className}`} />;
}

export function GoogleWalletBadge({ className = "", height = 48 }: BadgeProps) {
  return <img src="/badges/google-wallet-badge.svg" alt="" style={{ height }} className={`block w-auto ${className}`} />;
}
