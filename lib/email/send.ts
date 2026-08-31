import { Resend } from "resend";
import { getEnv } from "@/lib/env";
import type { PublicShop } from "@/lib/db/queries/shops";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Email a customer the link to their web card. Logs instead of sending when Resend isn't configured. */
export async function sendCardLinkEmail(to: string, shop: PublicShop, url: string): Promise<void> {
  const env = getEnv();
  const subject = `Your ${shop.name} stamp card`;
  const text = `Here's your ${shop.name} stamp card. Open it anytime:\n\n${url}\n\nCollect ${shop.stampsRequired} stamps to earn: ${shop.rewardText}.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1c1917">
<h1 style="font-size:20px;margin:0 0 12px">Your ${escapeHtml(shop.name)} stamp card</h1>
<p style="color:#57534e">Open it anytime from this link — bookmark it or add it to your home screen.</p>
<p><a href="${url}" style="display:inline-block;background:${escapeHtml(shop.brandColor)};color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">Open my card</a></p>
<p style="color:#57534e;font-size:14px">Collect ${shop.stampsRequired} stamps to earn: ${escapeHtml(shop.rewardText)}.</p>
<p style="color:#a8a29e;font-size:12px">Sent by Perk on behalf of ${escapeHtml(shop.name)}.</p></div>`;
  if (!env.AUTH_RESEND_KEY) {
    console.log(`\n[perk] Card link email for ${to}:\n${url}\n`);
    return;
  }
  const resend = new Resend(env.AUTH_RESEND_KEY);
  const { error } = await resend.emails.send({ from: env.AUTH_EMAIL_FROM, to, subject, text, html });
  if (error) throw new Error(`Email failed: ${error.message}`);
}
