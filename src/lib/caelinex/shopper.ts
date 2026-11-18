import "server-only";
import {
  type StorefrontResult,
  storefront,
  storefrontConnected,
} from "./storefront";

// Shopper sign-in and orders. The session token is shown once, kept in an
// httpOnly cookie (lib/session.ts) and sent as X-Shopper-Token.

export type Customer = {
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
};

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
type ShopperBody = {
  shopper: {
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email: string | null;
    emailVerified?: boolean;
    phone: string | null;
    phoneVerified?: boolean;
  };
};

const toCustomer = (b: ShopperBody): Customer => {
  const s = b.shopper;
  return {
    name: s.name ?? "",
    firstName: s.firstName ?? undefined,
    lastName: s.lastName ?? undefined,
    email: s.email ?? undefined,
    emailVerified: s.emailVerified,
    phone: s.phone ?? undefined,
    phoneVerified: s.phoneVerified,
  };
};

export async function getCustomer(
  token: string,
): Promise<StorefrontResult<Customer>> {
  const r = await storefront<ShopperBody>("/shopper/me", {
    headers: auth(token),
  });
  return r.ok ? { ok: true, value: toCustomer(r.value) } : r;
}

/** Change the name on the account. Email and mobile change by code instead. */
export async function updateShopperName(
  token: string,
  name: { firstName: string; lastName: string },
): Promise<StorefrontResult<Customer>> {
  const r = await storefront<ShopperBody>("/shopper/me", {
    method: "PATCH",
    headers: auth(token),
    body: JSON.stringify(name),
  });
  return r.ok ? { ok: true, value: toCustomer(r.value) } : r;
}

/** Send a code to the NEW email or mobile. Caelinex answers the same either way. */
export const requestContactChange = (
  token: string,
  to: { email: string } | { phone: string },
) =>
  storefront<{ sent: true }>("/shopper/me/change-contact", {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify(to),
  });

/** Apply the change once the code from the new address or number is right. */
export async function confirmContactChange(
  token: string,
  to: { email: string } | { phone: string },
  code: string,
): Promise<StorefrontResult<Customer>> {
  const r = await storefront<ShopperBody>(
    "/shopper/me/change-contact/confirm",
    {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ ...to, code }),
    },
  );
  return r.ok ? { ok: true, value: toCustomer(r.value) } : r;
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
  items: {
    name: string;
    variantName: string | null;
    quantity: number;
    /** The line's own photo, an absolute URL, or null when it had none. */
    imageUrl?: string | null;
  }[];
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

/** Sign this shopper out on every device, this one included. */
export const signOutEverywhere = (token: string) =>
  storefront<unknown>("/shopper/logout-all", {
    method: "POST",
    headers: auth(token),
  });

export type ShopperAddress = {
  id: string;
  name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  /** The state, as at checkout. */
  region: string | null;
  postalCode: string;
  /** A two-letter country code. */
  country: string;
  isDefault: boolean;
};

export type AddressInput = {
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

type AddressList = { addresses: ShopperAddress[] };

/** Saved delivery addresses, the default first. */
export const listAddresses = (token: string) =>
  storefront<AddressList>("/shopper/addresses", { headers: auth(token) });

export const saveAddress = (token: string, input: AddressInput, id?: string) =>
  storefront<AddressList>(
    id ? `/shopper/addresses/${id}` : "/shopper/addresses",
    {
      method: id ? "PUT" : "POST",
      headers: auth(token),
      body: JSON.stringify(input),
    },
  );

export const makeDefaultAddress = (token: string, id: string) =>
  storefront<AddressList>(`/shopper/addresses/${id}/default`, {
    method: "POST",
    headers: auth(token),
  });

export const deleteAddress = (token: string, id: string) =>
  storefront<AddressList>(`/shopper/addresses/${id}`, {
    method: "DELETE",
    headers: auth(token),
  });

type WishlistBody = { items: { product: { id: string } }[] };
const wishIds = (
  r: StorefrontResult<WishlistBody>,
): StorefrontResult<string[]> =>
  r.ok ? { ok: true, value: r.value.items.map((i) => i.product.id) } : r;

/** The product ids on the account's wishlist, newest first. */
export const listWishlistIds = async (token: string) =>
  wishIds(
    await storefront<WishlistBody>("/shopper/wishlist", {
      headers: auth(token),
    }),
  );

export const addToAccountWishlist = async (token: string, productId: string) =>
  wishIds(
    await storefront<WishlistBody>(`/shopper/wishlist/${productId}`, {
      method: "PUT",
      headers: auth(token),
    }),
  );

export const removeFromAccountWishlist = async (
  token: string,
  productId: string,
) =>
  wishIds(
    await storefront<WishlistBody>(`/shopper/wishlist/${productId}`, {
      method: "DELETE",
      headers: auth(token),
    }),
  );

/** Join this device's saved pieces to the account's, at sign-in. */
export const mergeAccountWishlist = async (
  token: string,
  productIds: string[],
) =>
  wishIds(
    await storefront<WishlistBody>("/shopper/wishlist/merge", {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ productIds }),
    }),
  );
