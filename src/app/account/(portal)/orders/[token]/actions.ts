"use server";

import { revalidatePath } from "next/cache";
import { requestReturn } from "@/lib/caelinex/returns";
import { getSessionToken } from "@/lib/session";
import { returnInput } from "@/lib/validation/forms";
import { check } from "@/lib/validation/schemas";

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
  const note = String(form.get("note") ?? "")
    .trim()
    .slice(0, 500);
  const qty: Record<string, string> = {};
  const picked: { orderLineId: string; quantity: number }[] = [];
  for (const k of form.keys()) {
    if (!k.startsWith("qty:")) continue;
    qty[k.slice(4)] = String(form.get(k));
    picked.push({
      orderLineId: k.slice(4),
      quantity: Number.parseInt(String(form.get(k)), 10),
    });
  }
  const values = { reason, note, qty };
  const input = check(returnInput, { orderToken, reason, note, lines: picked });
  if (!input.ok) return { error: input.message, values };
  const r = await requestReturn(input.value.orderToken, {
    reasonCode: input.value.reason,
    note: input.value.note,
    lines: input.value.lines,
  });
  if (!r.ok)
    return {
      error:
        r.message ?? "We couldn’t send your request. Try again in a minute.",
      values,
    };
  revalidatePath(`/account/orders/${input.value.orderToken}`);
  return { done: true };
}
