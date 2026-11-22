import "server-only";
import { matchRoute } from "./routes";

// Storefront API calls (`/v1/storefront`). The key is held on the server and
// never sent to the browser. See docs/retail/storefront-api.md in the
// Caelinex repo for the wire format.

const BASE = process.env.CAELINEX_API_URL?.replace(/\/+$/, "");
const KEY = process.env.CAELINEX_STOREFRONT_KEY;
const TIMEOUT_MS = 8000;

/** What a call may set: headers are plain strings, so none can be dropped or reordered. */
export type CallInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

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
 * Every call to Caelinex goes through here: the one place that holds the
 * storefront key, sends the shopper token, sets timeouts, retries safe reads
 * and logs failures without tokens in them.
 *
 * - The path must match a route in routes.ts, or the call is refused.
 * - `token` is the shopper's session token. It is sent only to routes that
 *   need it, and those routes refuse to go without it.
 * - `revalidate` (seconds) lets catalog reads be cached; everything else
 *   (carts, quotes, orders) is never cached.
 * - A GET is tried once more after a connection error or a 502, 503 or 504.
 *   A write is never retried: checkout has its own idempotency key for that.
 */
export async function storefront<T>(
  path: string,
  init: CallInit = {},
  opts: { revalidate?: number; token?: string } = {},
): Promise<StorefrontResult<T>> {
  if (!BASE || !KEY) return { ok: false, reason: "not-connected" };
  const method = (init.method ?? "GET").toUpperCase();
  const route = matchRoute(method, path, Boolean(opts.token));
  const requestId = crypto.randomUUID();
  if (!route) {
    log("refused", { requestId, method, withToken: Boolean(opts.token) });
    return { ok: false, reason: "invalid" };
  }
  const attempts = method === "GET" ? 2 : 1;
  let status = 0;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(`${BASE}/v1/storefront${path}`, {
        ...init,
        method,
        ...(opts.revalidate
          ? { next: { revalidate: opts.revalidate } }
          : { cache: "no-store" as const }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "content-type": "application/json",
          ...init.headers,
          // Set last, so a caller can never override them.
          "x-storefront-key": KEY,
          "x-request-id": requestId,
          ...(opts.token ? { "x-shopper-token": opts.token } : {}),
        },
      });
      status = res.status;
      if (RETRYABLE.has(status) && attempt < attempts) continue;
      if (CLIENT_ERRORS.has(status)) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: unknown;
          details?: { message?: unknown };
        };
        const m = err.details?.message ?? err.message;
        return {
          ok: false,
          reason: status === 401 ? "unauthorised" : "invalid",
          status,
          message: typeof m === "string" ? m : undefined,
        };
      }
      if (!res.ok) {
        log("failed", { requestId, route: route.name, status });
        return { ok: false, reason: "unavailable" };
      }
      const body = (await res.json()) as { data?: T };
      return body.data === undefined
        ? { ok: false, reason: "unavailable" }
        : { ok: true, value: body.data };
    } catch (e) {
      const timedOut = e instanceof Error && e.name === "TimeoutError";
      // A timeout means Caelinex is slow, so a second wait would only double it.
      if (!timedOut && attempt < attempts) continue;
      log("unreachable", {
        requestId,
        route: route.name,
        error: e instanceof Error ? e.name : "unknown",
      });
      return { ok: false, reason: "unavailable" };
    }
  }
  return { ok: false, reason: "unavailable" };
}

const RETRYABLE = new Set([502, 503, 504]);
const CLIENT_ERRORS = new Set([400, 401, 404, 409, 422]);

/** One JSON line per problem. Route names and ids only: no tokens, no shopper details. */
function log(event: string, fields: Record<string, unknown>) {
  console.error(JSON.stringify({ src: "caelinex", event, ...fields }));
}
