"use server";

import { lookupOrder, type Order } from "@/lib/caelinex/orders";
import { TRACK_MISSING, trackInput } from "@/lib/validation/forms";
import { check } from "@/lib/validation/schemas";

export type TrackState =
  | { step: "form"; error?: string; values?: Record<string, string> }
  | { step: "found"; order: Order };

const NOT_FOUND = "We couldn’t find an order with those details.";

export async function trackOrder(
  _prev: TrackState,
  form: FormData,
): Promise<TrackState> {
  const values = {
    number: String(form.get("number") ?? ""),
    contact: String(form.get("contact") ?? "").trim(),
  };
  const input = check(trackInput, values);
  if (!input.ok) return { step: "form", values, error: TRACK_MISSING };
  const { number, contact } = input.value;
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
