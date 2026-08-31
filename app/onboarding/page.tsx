import { redirect } from "next/navigation";
import { requireOwnerEmail } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { getShopForOwnerEmail } from "@/lib/db/queries/shops";
import { getEnv } from "@/lib/env";
import { OnboardingForm } from "./form";

export const metadata = { title: "Set up your shop" };

export default async function OnboardingPage() {
  const email = await requireOwnerEmail();
  if (await getShopForOwnerEmail(db, email)) redirect("/dashboard");
  const appHost = new URL(getEnv().NEXT_PUBLIC_APP_URL).host;
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-sm font-medium text-accent">Welcome to Perk</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Set up your stamp card</h1>
        <p className="mt-2 max-w-prose text-ink-soft">Takes about two minutes. You can change everything except your URL later.</p>
      </div>
      <OnboardingForm appHost={appHost} />
    </main>
  );
}
