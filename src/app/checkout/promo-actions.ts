"use server";

import {
  applyPromoCode,
  type PromoCart,
  removePromoCode,
} from "@/lib/caelinex/promo";
import { getCartToken } from "@/lib/session";
import { promoInput } from "@/lib/validation/forms";
import { check } from "@/lib/validation/schemas";

export type PromoResult =
  | { status: "applied"; cart: PromoCart }
  | { status: "removed"; cart: PromoCart }
  | { status: "rejected"; message: string }
  | { status: "no-cart" }
  | { status: "unavailable" };

const UNAVAILABLE = { status: "unavailable" } as const;

export async function applyPromo(code: string): Promise<PromoResult> {
  const clean = check(promoInput, code);
  if (!clean.ok) return { status: "rejected", message: clean.message };
  const token = await getCartToken();
  if (!token) return { status: "no-cart" };
  const r = await applyPromoCode(token, clean.value);
  if (r.ok) return { status: "applied", cart: r.value };
  return r.reason === "invalid"
    ? {
        status: "rejected",
        message: r.message ?? "That code can’t be used on this bag.",
      }
    : UNAVAILABLE;
}

export async function removePromo(): Promise<PromoResult> {
  const token = await getCartToken();
  if (!token) return { status: "no-cart" };
  const r = await removePromoCode(token);
  return r.ok ? { status: "removed", cart: r.value } : UNAVAILABLE;
}
