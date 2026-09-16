/* eslint-disable @next/next/no-img-element */
/**
 * Wallet CTAs using the official badge artwork. Neither may be restyled, recoloured or reshaped
 * (Apple: Add to Apple Wallet Guidelines, Wallet Marketing Artwork License; Google: Wallet brand
 * guidelines). Both are rendered at 48px high, the shared minimum.
 */

export function AppleWalletBadge({ className = "" }: { className?: string }) {
  return <img src="/badges/apple-wallet-badge.svg" alt="" className={`block h-12 w-auto ${className}`} />;
}

export function GoogleWalletBadge({ className = "" }: { className?: string }) {
  return <img src="/badges/google-wallet-button.svg" alt="" className={`block h-12 w-auto ${className}`} />;
}
