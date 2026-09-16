/* eslint-disable @next/next/no-img-element */
/**
 * Wallet CTAs using the official badge artwork. Neither may be restyled, recoloured or reshaped
 * (Apple: Add to Apple Wallet Guidelines, Wallet Marketing Artwork License; Google: Wallet brand
 * guidelines). Both scale proportionally: pass `height` (default 48px, the shared minimum) or
 * `width` to line several badges up at one width. Google's badge is the wider one, so keep any
 * shared width at 272px or more to hold its 48px minimum height.
 */
type BadgeProps = { className?: string; height?: number; width?: number };

function size({ height = 48, width }: BadgeProps) {
  return width ? { width, height: "auto" as const } : { height };
}

export function AppleWalletBadge(props: BadgeProps) {
  return <img src="/badges/apple-wallet-badge.svg" alt="" style={size(props)} className={`block w-auto ${props.className ?? ""}`} />;
}

export function GoogleWalletBadge(props: BadgeProps) {
  return <img src="/badges/google-wallet-button.svg" alt="" style={size(props)} className={`block w-auto ${props.className ?? ""}`} />;
}
