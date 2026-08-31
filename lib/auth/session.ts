import { redirect } from "next/navigation";
import { auth } from "./config";
import { db } from "@/lib/db/client";
import { getShopForOwnerEmail } from "@/lib/db/queries/shops";
import type { Shop } from "@/lib/db/schema";

export { resolveOwnerLanding, assertLoginAllowed, LOGIN_RATE_LIMIT } from "./helpers";

/** Email of the signed-in owner, or redirect to /login. */
export async function requireOwnerEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");
  return email.toLowerCase();
}

export async function getOwnerEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

/** Signed-in owner with a shop, or redirect to /login or /onboarding. */
export async function requireShop(): Promise<{ shop: Shop; ownerEmail: string }> {
  const ownerEmail = await requireOwnerEmail();
  const shop = await getShopForOwnerEmail(db, ownerEmail);
  if (!shop) redirect("/onboarding");
  return { shop, ownerEmail };
}
