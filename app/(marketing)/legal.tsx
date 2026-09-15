import Link from "next/link";

export const LEGAL_UPDATED = "16 September 2026";
export const CONTACT_EMAIL = "prasanth@ahlab.org";

/** Shared shell for the privacy policy and terms pages. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-full bg-accent" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">Perk</span>
        </Link>
        <nav className="flex gap-4 text-sm text-ink-soft">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/login" className="hover:text-ink">Sign in</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated {LEGAL_UPDATED}</p>
        <p className="mt-6 max-w-prose text-lg text-ink-soft">{intro}</p>
        <div className="legal mt-10 space-y-10">{children}</div>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-ink-muted">
          <span>Perk · digital stamp cards for coffee shops</span>
          <span className="flex gap-4"><Link href="/privacy" className="hover:text-ink">Privacy</Link><Link href="/terms" className="hover:text-ink">Terms</Link><a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">Contact</a></span>
        </div>
      </footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="max-w-prose space-y-3 text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">{children}</div>
    </section>
  );
}
