import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [/^\/dashboard(\/|$)/, /^\/onboarding(\/|$)/];

/** Optimistic cookie check; the real session check happens in requireOwnerEmail(). */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((re) => re.test(pathname))) return NextResponse.next();
  const hasSession = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
  if (hasSession) return NextResponse.next();
  const url = new URL("/login", req.nextUrl);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard/:path*", "/onboarding"] };
