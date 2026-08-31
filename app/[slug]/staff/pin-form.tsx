"use client";

import { useActionState } from "react";
import { enterStaffPin, type PinState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

export function PinForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<PinState, FormData>(enterStaffPin.bind(null, slug), {});
  return (
    <form action={action} className="mx-auto mt-10 max-w-xs space-y-4 text-center">
      <h1 className="text-xl font-semibold">Staff PIN</h1>
      <p className="text-sm text-ink-soft">Ask the owner for the 6-digit PIN. This device stays signed in for 30 days.</p>
      <Field label="PIN" htmlFor="pin" error={state.error}>
        <Input id="pin" name="pin" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code" placeholder="••••••" className="text-center font-mono text-2xl tracking-[0.4em]" required autoFocus invalid={!!state.error} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>Enter</Button>
    </form>
  );
}
