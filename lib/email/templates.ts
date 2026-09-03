import { randomBytes } from "node:crypto";
import { FEEDBACK_EMAIL } from "@/lib/feedback";

export type EmailContent = { subject: string; text: string; html: string };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const WRAP_OPEN = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1c1917">`;
const WRAP_CLOSE = `</div>`;

function button(url: string, label: string, color: string): string {
  return `<p><a href="${escapeHtml(url)}" style="display:inline-block;background:${escapeHtml(color)};color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">${label}</a></p>`;
}

const REPLY_TEXT = `Something not working, or an idea for Perk? Reply to this email and it reaches a person at ${FEEDBACK_EMAIL}.`;
const REPLY_HTML = `<p style="color:#a8a29e;font-size:12px">Something not working, or an idea for Perk? Reply to this email and it reaches a person.</p>`;

/** A short random tag so every sign-in email gets its own subject; Gmail otherwise threads them under the oldest one. */
function subjectTag(): string {
  return randomBytes(3).readUIntBE(0, 3).toString(36).padStart(4, "0").slice(-4);
}

export function buildMagicLinkEmail(p: { url: string; host: string; replyTo: string }): EmailContent {
  const subject = `Your Perk sign-in link · ${subjectTag()}`;
  const spamText = `Can't find our emails? Check your spam or Promotions folder and mark this one "not spam".`;
  const text = `Sign in to Perk on ${p.host}:\n\n${p.url}\n\nThe link works once and expires in 24 hours. If you didn't request it you can ignore this email.\n\n${spamText}\n${REPLY_TEXT}`;
  const html = `${WRAP_OPEN}
<h1 style="font-size:20px;margin:0 0 12px">Sign in to Perk</h1>
<p style="color:#57534e">Tap the button to sign in on ${escapeHtml(p.host)}. The link works once and expires in 24 hours.</p>
${button(p.url, "Sign in", "#1c1917")}
<p style="color:#57534e;font-size:14px">If you didn't request this you can ignore it.</p>
<p style="color:#a8a29e;font-size:12px">${escapeHtml(spamText)}</p>
${REPLY_HTML}${WRAP_CLOSE}`;
  return { subject, text, html };
}

type CardShop = { name: string; brandColor: string; stampsRequired: number; rewardText: string };

export function buildCardLinkEmail(p: { shop: CardShop; url: string }): EmailContent {
  const { shop, url } = p;
  const subject = `Your ${shop.name} stamp card`;
  const text = `Here's your ${shop.name} stamp card. Open it anytime:\n\n${url}\n\nCollect ${shop.stampsRequired} stamps to earn: ${shop.rewardText}.\n\n${REPLY_TEXT}`;
  const html = `${WRAP_OPEN}
<h1 style="font-size:20px;margin:0 0 12px">Your ${escapeHtml(shop.name)} stamp card</h1>
<p style="color:#57534e">Open it anytime from this link — bookmark it or add it to your home screen.</p>
${button(url, "Open my card", shop.brandColor)}
<p style="color:#57534e;font-size:14px">Collect ${shop.stampsRequired} stamps to earn: ${escapeHtml(shop.rewardText)}.</p>
<p style="color:#a8a29e;font-size:12px">Sent by Perk on behalf of ${escapeHtml(shop.name)}.</p>
${REPLY_HTML}${WRAP_CLOSE}`;
  return { subject, text, html };
}
