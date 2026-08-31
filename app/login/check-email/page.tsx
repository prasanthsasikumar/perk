export const metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-2xl" aria-hidden>✉️</div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-2 text-ink-soft">We sent you a sign-in link. It works once and expires in 24 hours. You can close this tab.</p>
      </div>
    </main>
  );
}
