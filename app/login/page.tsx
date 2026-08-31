import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerEmail } from "@/lib/auth/session";
import { LoginForm } from "./form";

export const metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const email = await getOwnerEmail();
  if (email) redirect("/dashboard");
  const sp = await props.searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-ink">
          <span className="inline-block h-6 w-6 rounded-full bg-accent" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">Perk</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your shop</h1>
        <p className="mt-1 text-ink-soft">We&rsquo;ll email you a one-time sign-in link. No password needed.</p>
        <div className="mt-8">
          <LoginForm authError={error} />
        </div>
        <p className="mt-8 text-sm text-ink-muted">New here? Use the same form — your shop is created after you sign in.</p>
      </div>
    </main>
  );
}
