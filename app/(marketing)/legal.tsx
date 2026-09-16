import Link from "next/link";
import { PerkMark } from "@/components/perk-mark";
import { SiteFooter } from "@/components/site-footer";

export const LEGAL_UPDATED = "16 September 2026";
export { COMPANY, CONTACT_EMAIL } from "@/lib/site";

/** Shared shell for the privacy policy and terms pages. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <PerkMark className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold tracking-tight">Perk</span>
        </Link>
        <nav className="flex gap-4 text-sm text-ink-soft">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated {LEGAL_UPDATED}</p>
        <p className="mt-6 max-w-prose text-lg text-ink-soft">{intro}</p>
        <div className="legal mt-10 space-y-10">{children}</div>
      </main>
      <SiteFooter width="max-w-3xl" />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="max-w-prose space-y-3 text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]">{children}</div>
    </section>
  );
}
