"use client";

import { useActionState, useEffect } from "react";
import { backupCardEmail, claimCardCookie, type BackupState } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClaimCookie({ slug, cardId }: { slug: string; cardId: string }) {
  useEffect(() => { void claimCardCookie(slug, cardId); }, [slug, cardId]);
  return null;
}

export function BackupForm({ slug, cardId, defaultEmail }: { slug: string; cardId: string; defaultEmail: string }) {
  const [state, action, pending] = useActionState<BackupState, FormData>(backupCardEmail.bind(null, slug, cardId), {});
  if (state.ok) return <p className="text-sm text-ok">Sent! Check your inbox.</p>;
  return (
    <form action={action} className="flex gap-2">
      <Input name="email" type="email" placeholder="you@example.com" defaultValue={defaultEmail} required aria-label="Email" invalid={!!state.error} />
      <Button type="submit" variant="secondary" loading={pending} className="shrink-0">Email me</Button>
      {state.error && <p className="basis-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
