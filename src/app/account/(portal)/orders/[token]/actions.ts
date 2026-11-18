"use server";

import { revalidatePath } from "next/cache";
import {
  RETURN_REASONS,
  type ReturnReason,
  requestReturn,
} from "@/lib/caelinex/returns";
import { getSessionToken } from "@/lib/session";

export type ReturnState = {
  done?: boolean;
  error?: string;
  /** What was chosen, so a mistake keeps the form. */
  values?: { reason: string; note: string; qty: Record<string, string> };
};

/** Ask to send pieces back. Caelinex decides what is allowed; its own words come back as the error. */
export async function askForReturn(
  orderToken: string,
  _prev: ReturnState,
  form: FormData,
): Promise<ReturnState> {
  if (!(await getSessionToken()))
    return { error: "Sign in again to ask for a return." };
  const reason = String(form.get("reason") ?? "");
  const noteText = String(form.get("note") ?? "")
    .trim()
    .slice(0, 500);
  const qty: Record<string, string> = {};
  for (const k of form.keys())
    if (k.startsWith("qty:")) qty[k.slice(4)] = String(form.get(k));
  const values = { reason, note: noteText, qty };
  if (!(reason in RETURN_REASONS))
    return { error: "Choose why you are returning it.", values };
  const lines = [...form.keys()]
    .filter((k) => k.startsWith("qty:"))
    .map((k) => ({
      orderLineId: k.slice(4),
      quantity: Number.parseInt(String(form.get(k)), 10),
    }))
    .filter((l) => Number.isInteger(l.quantity) && l.quantity > 0);
  if (lines.length === 0)
    return { error: "Choose the pieces you are returning.", values };
  const r = await requestReturn(orderToken, {
    reasonCode: reason as ReturnReason,
    note: noteText || undefined,
    lines,
  });
  if (!r.ok)
    return {
      error:
        r.message ?? "We couldn’t send your request. Try again in a minute.",
      values,
    };
  revalidatePath(`/account/orders/${orderToken}`);
  return { done: true };
}
