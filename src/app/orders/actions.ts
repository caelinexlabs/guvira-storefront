"use server";

import { lookupOrder, type Order } from "@/lib/caelinex/orders";
import { cleanIdentifier } from "@/lib/identity";

export type TrackState =
  | { step: "form"; error?: string; values?: Record<string, string> }
  | { step: "found"; order: Order };

const NOT_FOUND = "We couldn’t find an order with those details.";

export async function trackOrder(
  _prev: TrackState,
  form: FormData,
): Promise<TrackState> {
  const number = String(form.get("number") ?? "").replace(/\D/g, "");
  const raw = String(form.get("contact") ?? "").trim();
  const values = { number: String(form.get("number") ?? ""), contact: raw };
  const contact = cleanIdentifier(raw);
  if (!number || !contact)
    return {
      step: "form",
      values,
      error:
        "Enter your order number and the email or mobile you ordered with.",
    };
  const r = await lookupOrder(
    Number(number),
    contact.includes("@") ? { email: contact } : { phone: contact },
  );
  if (r.ok) return { step: "found", order: r.value };
  return {
    step: "form",
    values,
    error:
      r.reason === "invalid"
        ? NOT_FOUND
        : r.reason === "not-connected"
          ? "Order tracking isn’t switched on yet."
          : "We couldn’t reach our order service. Try again shortly.",
  };
}
