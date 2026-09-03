/** Where in-app feedback links and email replies go. Matches the Resend sender domain. */
export const FEEDBACK_EMAIL = "hello@flowsxr.com";

export function feedbackMailto(shopSlug?: string): string {
  const subject = shopSlug ? `Perk feedback (${shopSlug})` : "Perk feedback";
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
