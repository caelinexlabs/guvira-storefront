"use server";

import {
  applyPromoCode,
  type PromoCart,
  removePromoCode,
} from "@/lib/caelinex/promo";
import { getCartToken } from "@/lib/session";

export type PromoResult =
  | { status: "applied"; cart: PromoCart }
  | { status: "removed"; cart: PromoCart }
  | { status: "rejected"; message: string }
  | { status: "no-cart" }
  | { status: "unavailable" };

const UNAVAILABLE = { status: "unavailable" } as const;

export async function applyPromo(code: string): Promise<PromoResult> {
  const clean = code.replace(/\s+/g, "");
  if (!clean || clean.length > 40)
    return { status: "rejected", message: "Enter your code." };
  const token = await getCartToken();
  if (!token) return { status: "no-cart" };
  const r = await applyPromoCode(token, clean);
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
