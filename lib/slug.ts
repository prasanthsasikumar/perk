export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;
export const RESERVED_SLUGS = [
  "api", "dashboard", "login", "logout", "onboarding", "admin", "static", "_next",
  "favicon.ico", "robots.txt", "sitemap.xml", "manifest.webmanifest", "pass", "badges",
  "about", "pricing", "terms", "privacy", "help", "support",
] as const;

export function isValidSlug(s: string): boolean {
  return SLUG_RE.test(s) && !(RESERVED_SLUGS as readonly string[]).includes(s) && s.length >= 3;
}

/** "Blue Bottle Café!" → "blue-bottle-cafe" */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}
