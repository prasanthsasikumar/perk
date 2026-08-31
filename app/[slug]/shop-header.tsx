import type { PublicShop } from "@/lib/db/queries/shops";

export function ShopHeader({ shop, subtitle }: { shop: PublicShop; subtitle?: string }) {
  return (
    <header className="flex items-center gap-3">
      {shop.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shop.logoUrl} alt="" className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white" style={{ background: shop.brandColor }} aria-hidden>
          {shop.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div>
        <p className="text-lg font-semibold leading-tight">{shop.name}</p>
        {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
      </div>
    </header>
  );
}
