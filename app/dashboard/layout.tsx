import Link from "next/link";
import { requireShop } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/config";
import { DashNav } from "./nav";
import { FeedbackLink } from "@/components/feedback-link";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { shop, ownerEmail } = await requireShop();
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="no-print border-b border-line bg-paper lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-full bg-accent" aria-hidden />
            <span className="font-semibold tracking-tight">Perk</span>
          </Link>
          <p className="mt-0 truncate text-sm text-ink-soft lg:mt-4">{shop.name}</p>
        </div>
        <DashNav />
        <div className="hidden px-5 pb-5 lg:block">
          <p className="truncate text-xs text-ink-muted">{ownerEmail}</p>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="mt-1 text-xs text-ink-soft underline">Sign out</button>
          </form>
          <p className="mt-3"><FeedbackLink shopSlug={shop.slug} /></p>
        </div>
      </aside>
      <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
