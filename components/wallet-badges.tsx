/* eslint-disable @next/next/no-img-element */
/**
 * Wallet CTAs using the official badge artwork. Neither may be restyled, recoloured or reshaped
 * (Apple: Add to Apple Wallet Guidelines, Wallet Marketing Artwork License; Google: Wallet brand
 * guidelines). 48px is the shared minimum height.
 */

export function AppleWalletBadge({ className = "", height = 48 }: { className?: string; height?: number }) {
  return <img src="/badges/apple-wallet-badge.svg" alt="" style={{ height }} className={`block w-auto ${className}`} />;
}

export function GoogleWalletBadge({ className = "", height = 48 }: { className?: string; height?: number }) {
  return <img src="/badges/google-wallet-button.svg" alt="" style={{ height }} className={`block w-auto ${className}`} />;
}
