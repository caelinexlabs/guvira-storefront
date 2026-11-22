// Every Caelinex route the storefront may call. The client refuses anything
// else, so a new backend route is never reachable by accident, a crafted id
// can't turn into another path, and a shopper token only travels to routes
// that need one. Add a line here when a feature needs a new route.

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Route = {
  method: Method;
  /** A name for logs: it never holds a token or an id. */
  name: string;
  path: RegExp;
  /** "shopper" routes need X-Shopper-Token; the rest never carry one. */
  auth: "none" | "shopper";
  /** Whether a query string is allowed. */
  query?: boolean;
};

// A path segment starts with a letter or digit, so ".." can't climb out.
const SLUG = String.raw`[\w][\w.~-]{0,199}`;
// Tokens are base64url, so one can start with a dash; none can be a dot segment.
const CART = String.raw`[\w-][\w.~-]{7,299}`;
const ORDER = String.raw`[\w-]{10,100}`;
const ID = String.raw`[\w-]{1,64}`;
const HEX = "[0-9a-f]{32}";

const r = (
  method: Method,
  auth: Route["auth"],
  path: string,
  extra: { query?: boolean } = {},
): Route => ({
  method,
  auth,
  name: `${method} ${path
    .replaceAll(SLUG, ":slug")
    .replaceAll(CART, ":cart")
    .replaceAll(ORDER, ":order")
    .replaceAll(HEX, ":product")
    .replaceAll(ID, ":id")}`,
  path: new RegExp(`^${path}$`),
  ...extra,
});

export const ROUTES: Route[] = [
  // Catalog and settings
  r("GET", "none", ""),
  r("GET", "none", "/categories"),
  r("GET", "none", "/products", { query: true }),
  r("GET", "none", `/products/${SLUG}`),
  r("GET", "none", `/products/${SLUG}/reviews`, { query: true }),
  r("GET", "none", "/serviceability", { query: true }),

  // Carts and checkout
  r("POST", "none", "/carts"),
  r("POST", "none", "/carts/recover"),
  r("GET", "none", `/carts/${CART}`),
  r("PUT", "none", `/carts/${CART}/lines`),
  r("PUT", "none", `/carts/${CART}/email`),
  r("POST", "none", `/carts/${CART}/checkout`),
  r("POST", "none", `/carts/${CART}/promo`),
  r("DELETE", "none", `/carts/${CART}/promo`),
  r("GET", "none", `/carts/${CART}/shipping`, { query: true }),

  // Orders, by their own secret token
  r("POST", "none", "/orders/lookup"),
  r("GET", "none", `/orders/${ORDER}`),
  r("POST", "none", `/orders/${ORDER}/payment`),
  r("POST", "none", `/orders/${ORDER}/cancel`),
  r("GET", "none", `/orders/${ORDER}/reviews`),
  r("POST", "none", `/orders/${ORDER}/reviews`),
  r("GET", "none", `/orders/${ORDER}/returns`),
  r("POST", "none", `/orders/${ORDER}/returns`),

  // Shopper sign-in
  r("POST", "none", "/shopper/code"),
  r("POST", "none", "/shopper/verify"),

  // The signed-in shopper
  r("GET", "shopper", "/shopper/me"),
  r("PATCH", "shopper", "/shopper/me"),
  r("POST", "shopper", "/shopper/me/change-contact"),
  r("POST", "shopper", "/shopper/me/change-contact/confirm"),
  r("POST", "shopper", "/shopper/logout"),
  r("POST", "shopper", "/shopper/logout-all"),
  r("GET", "shopper", "/shopper/orders", { query: true }),
  r("POST", "shopper", "/shopper/cart/claim"),
  r("GET", "shopper", "/shopper/addresses"),
  r("POST", "shopper", "/shopper/addresses"),
  r("PUT", "shopper", `/shopper/addresses/${ID}`),
  r("DELETE", "shopper", `/shopper/addresses/${ID}`),
  r("POST", "shopper", `/shopper/addresses/${ID}/default`),
  r("GET", "shopper", "/shopper/wishlist", { query: true }),
  r("POST", "shopper", "/shopper/wishlist/merge"),
  r("PUT", "shopper", `/shopper/wishlist/${HEX}`),
  r("DELETE", "shopper", `/shopper/wishlist/${HEX}`),
];

const QUERY = /^\?[\w%.~+,=&*-]{0,1000}$/;

/** The route a request matches, or undefined when the storefront may not make it. */
export function matchRoute(
  method: string,
  fullPath: string,
  hasToken: boolean,
): Route | undefined {
  const at = fullPath.indexOf("?");
  const path = at < 0 ? fullPath : fullPath.slice(0, at);
  const query = at < 0 ? "" : fullPath.slice(at);
  const m = method.toUpperCase();
  const found = ROUTES.find((x) => x.method === m && x.path.test(path));
  if (!found) return undefined;
  if (query && !(found.query && QUERY.test(query))) return undefined;
  if ((found.auth === "shopper") !== hasToken) return undefined;
  return found;
}
