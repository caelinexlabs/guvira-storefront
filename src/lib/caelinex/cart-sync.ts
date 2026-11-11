import "server-only";
import { clearCartToken, getCartToken, setCartToken } from "@/lib/session";
import { type Cart, createCart, getCart, putCartLine } from "./cart";

export type WantedLine = { id: string; qty: number };
export type SyncResult =
  | {
      status: "ok";
      token: string;
      cart: Cart;
      /** Lines Caelinex wouldn't hold at the quantity asked, with its reason. */
      problems: { id: string; message: string }[];
    }
  | { status: "empty" }
  | { status: "unavailable" };

/**
 * Makes the Caelinex cart match the bag. The browser's bag is a copy; the
 * cart is what Caelinex prices, stock-checks and sells. A missing or expired
 * cart is replaced and refilled from the bag.
 */
export async function syncCart(wanted: WantedLine[]): Promise<SyncResult> {
  const lines = wanted.filter((l) => l.qty > 0).slice(0, 50);
  let token = await getCartToken();
  let cart = token ? await getCart(token) : undefined;

  if (!lines.length && !(cart?.ok && cart.value.lines.length))
    return { status: "empty" };

  // A cart that has become an order can't take new lines; start a fresh one.
  const stale = cart?.ok && cart.value.status && cart.value.status !== "OPEN";
  if (!token || !cart?.ok || stale) {
    if (cart && !cart.ok && cart.reason !== "invalid")
      return { status: "unavailable" };
    const made = await createCart();
    if (!made.ok) return { status: "unavailable" };
    token = made.value.token;
    await setCartToken(token);
    cart = { ok: true, value: made.value };
  }

  const problems: { id: string; message: string }[] = [];
  let current = cart.value;
  const have = new Map(current.lines.map((l) => [l.productId, l.quantity]));

  const put = async (id: string, qty: number) => {
    const r = await putCartLine(token as string, id, qty);
    if (r.ok) current = r.value;
    else if (r.reason === "invalid")
      problems.push({
        id,
        message: r.message ?? "That piece can’t be added right now.",
      });
    return r.ok || r.reason === "invalid";
  };

  for (const l of lines)
    if (have.get(l.id) !== l.qty && !(await put(l.id, l.qty)))
      return { status: "unavailable" };
  for (const id of have.keys())
    if (!lines.some((l) => l.id === id) && !(await put(id, 0)))
      return { status: "unavailable" };

  return { status: "ok", token, cart: current, problems };
}

/** Forget the cart once it has become an order. */
export const forgetCart = clearCartToken;
