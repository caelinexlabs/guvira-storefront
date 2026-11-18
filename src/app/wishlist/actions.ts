"use server";

import {
  addToAccountWishlist,
  mergeAccountWishlist,
  removeFromAccountWishlist,
} from "@/lib/caelinex/shopper";
import { getSessionToken } from "@/lib/session";

export type WishlistResult =
  | { status: "ok"; ids: string[] }
  | { status: "signed-out" | "unavailable" };

const ID = /^[0-9a-f]{32}$/;

/** At page load: join this device's list to the account's and hand back the union. */
export async function mergeDeviceWishlist(
  deviceIds: string[],
): Promise<WishlistResult> {
  const token = await getSessionToken();
  if (!token) return { status: "signed-out" };
  const ids = (Array.isArray(deviceIds) ? deviceIds : [])
    .filter((i) => typeof i === "string" && ID.test(i))
    .slice(0, 100);
  const r = await mergeAccountWishlist(token, ids);
  return r.ok ? { status: "ok", ids: r.value } : { status: "unavailable" };
}

/** After a heart is pressed: keep the account's list the same. */
export async function setWishlisted(
  productId: string,
  on: boolean,
): Promise<WishlistResult> {
  const token = await getSessionToken();
  if (!token) return { status: "signed-out" };
  if (typeof productId !== "string" || !ID.test(productId))
    return { status: "unavailable" };
  const r = on
    ? await addToAccountWishlist(token, productId)
    : await removeFromAccountWishlist(token, productId);
  return r.ok ? { status: "ok", ids: r.value } : { status: "unavailable" };
}
