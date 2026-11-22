"use server";

import {
  type CartLine,
  claimCart,
  getCart,
  putCartEmail,
  recoverCart,
} from "@/lib/caelinex/cart";
import {
  type SyncResult,
  syncCart,
  type WantedLine,
} from "@/lib/caelinex/cart-sync";
import { getProduct, listProducts } from "@/lib/commerce";
import { getCartToken, getSessionToken, setCartToken } from "@/lib/session";
import type { BagLine } from "@/lib/store/shop";
import { cartSecret, emailAddress } from "@/lib/validation/schemas";

export type BagSyncResult =
  | {
      status: "ok";
      /** What Caelinex holds, by product id. */
      held: { id: string; qty: number; issue: string | null }[];
      problems: { id: string; message: string }[];
    }
  | { status: "empty" | "unavailable" };

/** Called when the bag changes: mirror it into the Caelinex cart. */
export async function syncBag(lines: WantedLine[]): Promise<BagSyncResult> {
  const r: SyncResult = await syncCart(lines);
  if (r.status !== "ok") return { status: r.status };
  return {
    status: "ok",
    held: r.cart.lines.map((l) => ({
      id: l.productId,
      qty: l.quantity,
      issue: l.issue,
    })),
    problems: r.problems,
  };
}

/**
 * Attach the shopper's email to their Caelinex cart. Callers call it only when
 * the shop sends reminders. A bad address or a missing cart is skipped, so it
 * never blocks checkout.
 */
export async function saveCartEmail(email: string): Promise<void> {
  const address = emailAddress().safeParse(email);
  if (!address.success) return;
  const token = await getCartToken();
  if (token) await putCartEmail(token, address.data);
}

export type RecoverResult =
  | { status: "ok"; lines: BagLine[] }
  | { status: "expired" | "unavailable" };

/**
 * Open the cart a reminder email linked to. The secret works once, so call this
 * only from a page that ran in a browser, never from a link preview. The answer
 * holds a new cart token. Keep it, and hand back the bag.
 */
export async function recoverBag(secret: string): Promise<RecoverResult> {
  if (!cartSecret.safeParse(secret).success) return { status: "expired" };
  const r = await recoverCart(secret);
  if (!r.ok)
    return { status: r.reason === "invalid" ? "expired" : "unavailable" };
  await setCartToken(r.value.token);

  const cart = await getCart(r.value.token);
  return {
    status: "ok",
    lines: await bagFromLines(cart.ok ? cart.value.lines : r.value.lines),
  };
}

/**
 * The cart knows ids and quantities; the bag also wants the product's link,
 * photo and prices, which the catalog holds.
 */
async function bagFromLines(lines: CartLine[]): Promise<BagLine[]> {
  const products = new Map((await listProducts()).map((p) => [p.id, p]));
  // The list is capped and a failed page ends it early, so a piece it lacks
  // is looked up on its own before being dropped. Dropping a line here makes
  // the next sync delete it from the cart.
  const missing = lines.filter(
    (l) => l.quantity > 0 && !products.has(l.productId),
  );
  const found = await Promise.all(missing.map((l) => getProduct(l.productId)));
  for (const p of found) if (p) products.set(p.id, p);
  const bag: BagLine[] = [];
  for (const l of lines) {
    const p = products.get(l.productId);
    if (!p || l.quantity < 1) continue;
    bag.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      line: p.line,
      image: p.images[0],
      prices: p.prices,
      size: l.variantName ?? undefined,
      qty: l.quantity,
    });
  }
  return bag;
}

export type ClaimResult =
  | { status: "ok"; lines: BagLine[] }
  | { status: "none" | "signed-out" | "unavailable" };

/**
 * For a signed-in shopper: joins this browser's cart to the one saved on their
 * account, so a bag filled on another device appears here. Keeps the cart
 * token Caelinex answers with and hands back the bag.
 */
export async function claimBag(): Promise<ClaimResult> {
  const session = await getSessionToken();
  if (!session) return { status: "signed-out" };
  const r = await claimCart(session, await getCartToken());
  if (!r.ok)
    return {
      status: r.reason === "unauthorised" ? "signed-out" : "unavailable",
    };
  if (!r.value.token || !r.value.cart) return { status: "none" };
  await setCartToken(r.value.token);
  return { status: "ok", lines: await bagFromLines(r.value.cart.lines) };
}
