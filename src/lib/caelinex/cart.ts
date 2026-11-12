import "server-only";
import type { Order } from "./orders";
import { type StorefrontResult, storefront } from "./storefront";

/** A line as Caelinex holds it: the stock check and price are Caelinex's. */
export type CartLine = {
  productId: string;
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  available: number;
  issue: "unavailable" | "not_enough_stock" | null;
};

export type Cart = {
  status?: string;
  currency: string;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  canCheckout: boolean;
  promoCode?: string | null;
  promoProblem?: { reason: string; message: string } | null;
  discounts?: {
    name: string;
    code: string | null;
    kind: string;
    amount: number;
  }[];
  discountTotal?: number;
  freeShipping?: boolean;
  subtotalAfterDiscount?: number;
};

type Created = Cart & { token: string };

/** The order, plus Razorpay's window details when it is waiting for payment. */
export type CheckedOut = Order & {
  token: string;
  payment?: {
    keyId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  } | null;
};

const path = (token: string, rest = "") =>
  `/carts/${encodeURIComponent(token)}${rest}`;

/** Makes a cart. Its token is shown once, so the caller must keep it. */
export const createCart = (): Promise<StorefrontResult<Created>> =>
  storefront<Created>("/carts", { method: "POST", body: "{}" });

export const getCart = (token: string): Promise<StorefrontResult<Cart>> =>
  storefront<Cart>(path(token));

/** Sets how many of a product are in the cart; 0 removes it. */
export const putCartLine = (
  token: string,
  productId: string,
  quantity: number,
): Promise<StorefrontResult<Cart>> =>
  storefront<Cart>(path(token, "/lines"), {
    method: "PUT",
    body: JSON.stringify({ productId, quantity }),
  });

export type CheckoutBody = {
  email: string;
  name: string;
  phone: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  shippingRateId?: string;
  paymentMethod: "COD" | "RAZORPAY";
};

/** Places the order. The key makes a retry of the same attempt safe. */
export const checkoutCart = (
  token: string,
  body: CheckoutBody,
  idempotencyKey: string,
): Promise<StorefrontResult<CheckedOut>> =>
  storefront<CheckedOut>(path(token, "/checkout"), {
    method: "POST",
    headers: { "idempotency-key": idempotencyKey },
    body: JSON.stringify(body),
  });

/** Keeps the shopper's email on the cart, so a reminder can reach them. "" removes it. */
export const putCartEmail = (
  token: string,
  email: string,
): Promise<StorefrontResult<Cart>> =>
  storefront<Cart>(path(token, "/email"), {
    method: "PUT",
    body: JSON.stringify({ email }),
  });

/**
 * Opens the cart a reminder email linked to. The secret works once: the answer
 * carries a NEW cart token, and the old one stops working.
 */
export const recoverCart = (
  secret: string,
): Promise<StorefrontResult<Created>> =>
  storefront<Created>("/carts/recover", {
    method: "POST",
    body: JSON.stringify({ token: secret }),
  });
