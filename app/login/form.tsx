"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

const AUTH_ERRORS: Record<string, string> = {
  Verification: "That sign-in link has expired or was already used. Request a new one.",
  Configuration: "We couldn't send your sign-in email just now. Please try again in a few minutes.",
};

export function LoginForm({ authError }: { authError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestMagicLink, {});
  const error = state.error ?? (authError ? AUTH_ERRORS[authError] ?? "Something went wrong signing you in." : undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" htmlFor="email" error={error}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@yourcafe.com" required autoFocus invalid={!!error} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Email me a sign-in link
      </Button>
    </form>
  );
}
