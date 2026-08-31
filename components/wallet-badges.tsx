/**
 * Placeholder wallet badges drawn in the spirit of the official ones. Before launch, replace with the
 * official assets from Apple (Add to Apple Wallet) and Google (Add to Google Wallet) per their brand guidelines.
 */
export function AppleWalletBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-4 text-white ${className}`}>
      <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden><rect x="1" y="1" width="24" height="18" rx="3" fill="#fff" opacity=".15" /><rect x="1" y="4" width="24" height="4" fill="#e5533d" /><rect x="1" y="8" width="24" height="4" fill="#f0a63c" /><rect x="1" y="12" width="24" height="7" rx="1" fill="#4aa3df" /></svg>
      <span className="leading-none"><span className="block text-[10px] opacity-80">Add to</span><span className="block text-[15px] font-semibold">Apple Wallet</span></span>
    </span>
  );
}

export function GoogleWalletBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-4 text-white ${className}`}>
      <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden><rect x="1" y="2" width="24" height="16" rx="3" fill="#fff" opacity=".15" /><path d="M1 8h24v4H1z" fill="#34a853" /><path d="M1 4h24v4H1z" fill="#4285f4" /><path d="M1 12h24v4H1z" fill="#fbbc04" /></svg>
      <span className="leading-none"><span className="block text-[10px] opacity-80">Add to</span><span className="block text-[15px] font-semibold">Google Wallet</span></span>
    </span>
  );
}
