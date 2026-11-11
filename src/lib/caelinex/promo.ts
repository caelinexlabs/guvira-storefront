import "server-only";
import { type StorefrontResult, storefront } from "./storefront";

export type CartDiscount = {
  name: string;
  code: string | null;
  kind: string;
  amount: number;
};

/** The parts of a Caelinex cart the promo UI needs. */
export type PromoCart = {
  currency: string;
  subtotal: number;
  promoCode: string | null;
  promoProblem: { reason: string; message: string } | null;
  discounts: CartDiscount[];
  discountTotal: number;
  freeShipping: boolean;
  subtotalAfterDiscount: number;
};

const path = (token: string) => `/carts/${encodeURIComponent(token)}/promo`;

export const applyPromoCode = (
  token: string,
  code: string,
): Promise<StorefrontResult<PromoCart>> =>
  storefront<PromoCart>(path(token), {
    method: "POST",
    body: JSON.stringify({ code }),
  });

export const removePromoCode = (
  token: string,
): Promise<StorefrontResult<PromoCart>> =>
  storefront<PromoCart>(path(token), { method: "DELETE" });
