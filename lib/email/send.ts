import { Resend } from "resend";
import { getEnv } from "@/lib/env";
import { FEEDBACK_EMAIL } from "@/lib/feedback";
import { buildCardLinkEmail, buildMagicLinkEmail, type EmailContent } from "@/lib/email/templates";
import type { PublicShop } from "@/lib/db/queries/shops";

/** Send through Resend, or log the link to the console when no key is configured (dev). */
async function deliver(to: string, content: EmailContent, devLabel: string, devUrl: string): Promise<void> {
  const env = getEnv();
  if (!env.AUTH_RESEND_KEY) {
    console.log(`\n[perk] ${devLabel} for ${to}:\n${devUrl}\n`);
    return;
  }
  const resend = new Resend(env.AUTH_RESEND_KEY);
  const { error } = await resend.emails.send({ from: env.AUTH_EMAIL_FROM, to, replyTo: FEEDBACK_EMAIL, ...content });
  if (error) throw new Error(`Email failed: ${error.message}`);
}

/** Owner sign-in (magic link) email. */
export async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  const { host } = new URL(url);
  await deliver(to, buildMagicLinkEmail({ url, host, replyTo: FEEDBACK_EMAIL }), "Magic link", url);
}

/** Email a customer the link to their web card. */
export async function sendCardLinkEmail(to: string, shop: PublicShop, url: string): Promise<void> {
  await deliver(to, buildCardLinkEmail({ shop, url }), "Card link email", url);
}
