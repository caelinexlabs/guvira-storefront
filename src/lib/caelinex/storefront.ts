import "server-only";

// Storefront API calls (`/v1/storefront`). The key is held on the server and
// never sent to the browser. See docs/retail/storefront-api.md in the
// Caelinex repo for the wire format.

const BASE = process.env.CAELINEX_API_URL?.replace(/\/+$/, "");
const KEY = process.env.CAELINEX_STOREFRONT_KEY;
const TIMEOUT_MS = 8000;

export type StorefrontResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      reason: "not-connected" | "unauthorised" | "invalid" | "unavailable";
      /** Caelinex's own wording, fit to show a shopper (4xx answers only). */
      message?: string;
      /** The HTTP status, for 4xx answers. */
      status?: number;
    };

/** True when both the API address and a storefront key are set. */
export const storefrontConnected = Boolean(BASE && KEY);

/**
 * `revalidate` (seconds) lets catalog reads be cached; everything else
 * (carts, quotes, orders) is never cached.
 */
export async function storefront<T>(
  path: string,
  init: RequestInit = {},
  opts: { revalidate?: number } = {},
): Promise<StorefrontResult<T>> {
  if (!BASE || !KEY) return { ok: false, reason: "not-connected" };
  try {
    const res = await fetch(`${BASE}/v1/storefront${path}`, {
      ...init,
      ...(opts.revalidate
        ? { next: { revalidate: opts.revalidate } }
        : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "content-type": "application/json",
        "x-storefront-key": KEY,
        ...init.headers,
      },
    });
    if (
      res.status === 400 ||
      res.status === 401 ||
      res.status === 404 ||
      res.status === 422 ||
      res.status === 409
    ) {
      const err = (await res.json().catch(() => ({}))) as {
        message?: unknown;
        details?: { message?: unknown };
      };
      const m = err.details?.message ?? err.message;
      return {
        ok: false,
        reason: res.status === 401 ? "unauthorised" : "invalid",
        status: res.status,
        message: typeof m === "string" ? m : undefined,
      };
    }
    if (!res.ok) return { ok: false, reason: "unavailable" };
    const body = (await res.json()) as { data?: T };
    return body.data === undefined
      ? { ok: false, reason: "unavailable" }
      : { ok: true, value: body.data };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
