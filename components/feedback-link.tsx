import { feedbackMailto } from "@/lib/feedback";

/** Mailto that opens a feedback email with the shop in the subject. */
export function FeedbackLink({ shopSlug, className = "text-xs text-ink-soft underline" }: { shopSlug?: string; className?: string }) {
  return (
    <a href={feedbackMailto(shopSlug)} className={className}>
      Something confusing? Tell us
    </a>
  );
}
