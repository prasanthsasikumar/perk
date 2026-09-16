import Link from "next/link";
import { PerkMark } from "@/components/perk-mark";
import { COMPANY, CONTACT_EMAIL, SOURCE_URL } from "@/lib/site";

/** Shared site footer. `width` matches the page's content column so the columns line up. */
export function SiteFooter({ width = "max-w-6xl" }: { width?: string }) {
  return (
    <footer className="no-print border-t border-line bg-surface-muted">
      <div className={`mx-auto w-full ${width} px-5 py-12`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <PerkMark className="h-6 w-6 text-accent" />
              <span className="text-lg font-semibold tracking-tight text-ink">Perk</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Digital stamp cards for coffee shops, delivered to Apple Wallet and Google Wallet. Free to use.
            </p>
          </div>

          <FooterCol title="Product">
            <FooterLink href="/#how">How it works</FooterLink>
            <FooterLink href="/#pricing">Pricing</FooterLink>
            <FooterLink href="/#faq">Questions</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterCol>

          <FooterCol title="Perk">
            <FooterLink href={`mailto:${CONTACT_EMAIL}`}>Contact</FooterLink>
            <FooterLink href={SOURCE_URL}>Source on GitHub</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {COMPANY}. Built in New Zealand.</p>
          <p>Apple Wallet is a trademark of Apple Inc. Google Wallet is a trademark of Google LLC.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const className = "text-ink-soft transition-colors hover:text-ink";
  return (
    <li>
      {external ? (
        <a href={href} className={className} rel="noreferrer">{children}</a>
      ) : (
        <Link href={href} className={className}>{children}</Link>
      )}
    </li>
  );
}
