/** Perk's standalone mark: a stamp block with the P punched out as negative space.
 *  Flat single colour only — see docs/brand/BRAND_IDENTITY.md section 2. */
export function PerkMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 26C10 17.1634 17.1634 10 26 10H74C82.8366 10 90 17.1634 90 26V74C90 82.8366 82.8366 90 74 90H26C17.1634 90 10 82.8366 10 74V26ZM30 26H52C61.9411 26 70 34.0589 70 44C70 53.9411 61.9411 62 52 62H44V74H30V26ZM44 37V51H52C55.866 51 59 47.866 59 44C59 40.134 55.866 37 52 37H44Z"
        fill="currentColor"
      />
    </svg>
  );
}
