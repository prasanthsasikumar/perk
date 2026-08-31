"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { assertLoginAllowed } from "@/lib/auth/helpers";
import { isDomainError } from "@/lib/domain/errors";

export type LoginState = { error?: string };

export async function requestMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.string().email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { error: "Enter a valid email address." };
  try {
    await assertLoginAllowed(db, parsed.data);
  } catch (e) {
    if (isDomainError(e)) return { error: e.message };
    throw e;
  }
  await signIn("resend", { email: parsed.data, redirectTo: "/dashboard" });
  return {};
}
