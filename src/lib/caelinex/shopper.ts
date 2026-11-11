import "server-only";
import {
  type StorefrontResult,
  storefront,
  storefrontConnected,
} from "./storefront";

// Shopper sign-in and orders. The session token is shown once, kept in an
// httpOnly cookie (lib/session.ts) and sent as X-Shopper-Token.

export type Customer = { name: string; email?: string; phone?: string };

/** True when the app can reach Caelinex with a storefront key. */
export const caelinexConnected = storefrontConnected;

const auth = (token: string) => ({ "x-shopper-token": token });

const contact = (identifier: string) =>
  identifier.includes("@") ? { email: identifier } : { phone: identifier };

/**
 * Ask for a sign-in code. Caelinex answers the same whether or not the
 * address is known, so there is no "not found" to show.
 */
export const requestSignInCode = (
  identifier: string,
): Promise<StorefrontResult<{ sent: boolean }>> =>
  storefront("/shopper/code", {
    method: "POST",
    body: JSON.stringify(contact(identifier)),
  });

/** Swap a code for a session token (30 days). */
export async function verifySignInCode(
  identifier: string,
  code: string,
): Promise<StorefrontResult<string>> {
  const r = await storefront<{ token?: unknown }>("/shopper/verify", {
    method: "POST",
    body: JSON.stringify({ ...contact(identifier), code }),
  });
  if (!r.ok) return r;
  return typeof r.value.token === "string"
    ? { ok: true, value: r.value.token }
    : { ok: false, reason: "unavailable" };
}

/** Who a token belongs to. A new shopper's name is null: we only know the email. */
export async function getCustomer(
  token: string,
): Promise<StorefrontResult<Customer>> {
  const r = await storefront<{
    shopper: {
      name: string | null;
      email: string | null;
      phone: string | null;
    };
  }>("/shopper/me", { headers: auth(token) });
  if (!r.ok) return r;
  const s = r.value.shopper;
  return {
    ok: true,
    value: {
      name: s.name ?? "",
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
    },
  };
}

export const signOutShopper = (token: string) =>
  storefront<unknown>("/shopper/logout", {
    method: "POST",
    headers: auth(token),
  });

export type ShopperOrder = {
  orderNumber: number;
  token: string;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID";
  fulfilmentStatus: "UNFULFILLED" | "PARTIAL" | "FULFILLED";
  paymentMethod: string | null;
  placedAt: string;
  currency: string;
  total: number;
  itemCount: number;
  items: { name: string; variantName: string | null; quantity: number }[];
  tracking: {
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
  }[];
};

export const listShopperOrders = (
  token: string,
  page = 1,
): Promise<
  StorefrontResult<{ total: number; pages: number; orders: ShopperOrder[] }>
> =>
  storefront(`/shopper/orders?page=${page}&pageSize=20`, {
    headers: auth(token),
  });

/**
 * New-drop and restock emails. Caelinex has no mailing-list endpoint yet
 * (docs/caelinex-api-needs.md), so this reports "not-connected" and the
 * storefront shows that sign-ups aren't open.
 */
export async function subscribeToNewsletter(
  _email: string,
): Promise<StorefrontResult<void>> {
  return { ok: false, reason: "not-connected" };
}

/** Whether the newsletter form can take sign-ups in this build. */
export const newsletterOpen = false;
