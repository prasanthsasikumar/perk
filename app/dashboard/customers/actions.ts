"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { adjustStamps } from "@/lib/domain/cards";
import { isDomainError } from "@/lib/domain/errors";
import { listEvents } from "@/lib/db/queries/events";
import { scheduleWalletUpdate } from "@/lib/wallet";

export type AdjustState = { ok?: boolean; error?: string };

export async function adjustCard(_prev: AdjustState, formData: FormData): Promise<AdjustState> {
  const { shop, ownerEmail } = await requireShop();
  const parsed = z
    .object({ cardId: z.string().uuid(), delta: z.coerce.number().int().min(-30).max(30).refine((n) => n !== 0, "Choose a non-zero change"), note: z.string().trim().min(2, "Add a short reason").max(140) })
    .safeParse({ cardId: formData.get("cardId"), delta: formData.get("delta"), note: formData.get("note") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    const r = await adjustStamps(db, shop.id, parsed.data.cardId, parsed.data.delta, parsed.data.note, { source: "owner_adjust", actor: ownerEmail });
    scheduleWalletUpdate(shop, r.card);
  } catch (e) {
    if (isDomainError(e)) return { error: e.message };
    throw e;
  }
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cardHistory(cardId: string) {
  const { shop } = await requireShop();
  const { items } = await listEvents(db, shop.id, { cardId, limit: 50 });
  return items.map((e) => ({ id: e.id, type: e.type, delta: e.delta, source: e.source, actor: e.actor, note: e.note, at: e.createdAt.toISOString() }));
}
