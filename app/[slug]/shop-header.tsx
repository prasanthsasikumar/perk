import type { PublicShop } from "@/lib/db/queries/shops";

export function ShopHeader({ shop, subtitle }: { shop: PublicShop; subtitle?: string }) {
  return (
    <header className="flex items-center gap-3.5">
      <span className="flex h-[52px] w-[52px] flex-none items-center justify-center overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_1px_2px_rgba(18,18,18,0.05)]">
        {shop.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.logoUrl} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl font-bold text-white" style={{ background: shop.brandColor }} aria-hidden>
            {shop.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-lg font-semibold leading-tight tracking-[-0.01em]">{shop.name}</p>
        {subtitle && <p className="text-[13px] tracking-[0.01em] text-ink-muted">{subtitle}</p>}
      </div>
    </header>
  );
}
