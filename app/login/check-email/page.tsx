import { getEnv } from "@/lib/env";

export const metadata = { title: "Check your email" };

/** "Perk <hello@x.com>" → "hello@x.com" */
function senderAddress(from: string): string {
  return from.match(/<([^>]+)>/)?.[1] ?? from;
}

export default function CheckEmailPage() {
  const sender = senderAddress(getEnv().AUTH_EMAIL_FROM);
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-2xl" aria-hidden>✉️</div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-2 text-ink-soft">We sent you a sign-in link. It works once and expires in 24 hours. You can close this tab.</p>
        <p className="mt-4 text-sm text-ink-muted">
          Not there after a minute? Check your spam or Promotions folder and mark it &ldquo;not spam&rdquo;. It comes from <span className="whitespace-nowrap font-medium text-ink-soft">{sender}</span>.
        </p>
      </div>
    </main>
  );
}
