import { z } from "zod";
import { cleanIdentifier, isEmail, isPhone } from "@/lib/identity";

// One place for what counts as a well-formed id, token, quantity or contact.
// Every server action and the Caelinex client check input against these
// instead of keeping a regex of its own. Pure, so a form can use them too.

export type Checked<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; field?: string };

/** Parse `input`; on failure answer with the first message, fit to show a shopper. */
export function check<S extends z.ZodType>(
  schema: S,
  input: unknown,
): Checked<z.output<S>> {
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, value: r.data };
  const issue = r.error.issues[0];
  const first = issue?.path[0];
  return {
    ok: false,
    message: issue?.message ?? "Check the details and try again.",
    field: typeof first === "string" ? first : undefined,
  };
}

/* ---------- ids and tokens ---------- */

const ORDER_MISSING = "We couldn’t find that order. Reload the page.";

/** A product (or variant) id as Caelinex issues it. */
export const productId = z
  .string()
  .regex(/^[0-9a-f]{32}$/, "That piece can’t be found.");

/** The secret that opens a guest order page. */
export const orderToken = z.string().regex(/^[\w-]{10,100}$/, ORDER_MISSING);

/** An order line, review listing or shipping rate id. */
export const shortId = z
  .string()
  .regex(/^[\w-]{1,64}$/, "Reload the page and try again.");

export const listingId = z.string().regex(/^[\w-]{1,64}$/, ORDER_MISSING);
export const orderLineId = z.string().regex(/^[\w-]{1,64}$/, ORDER_MISSING);
export const addressId = z
  .string()
  .regex(
    /^[\w-]{1,64}$/,
    "That address can’t be found. Reload the page and try again.",
  );

/** The one-time secret in a cart reminder link. */
export const cartSecret = z.string().regex(/^[\w.~-]{8,300}$/);

/** A checkout attempt's key; Caelinex takes 8 to 100 characters. */
export const idempotencyKey = z.string().min(8).max(100);

/* ---------- the bag ---------- */

export const MAX_LINES = 50;
export const MAX_QTY = 99;

export type WantedLine = { id: string; qty: number };

const bagLine = z.object({ id: productId, qty: z.number().int() });

/**
 * The browser's bag is untrusted input. Keep only well-formed product ids,
 * whole quantities from zero to 99 and one entry per product. A bad entry is
 * dropped, not an error, so one stale line never blocks the rest.
 */
export const bagLines = z.unknown().transform((input): WantedLine[] => {
  if (!Array.isArray(input)) return [];
  const seen = new Map<string, number>();
  for (const item of input.slice(0, 500)) {
    const r = bagLine.safeParse(item);
    if (r.success)
      seen.set(r.data.id, Math.min(Math.max(r.data.qty, 0), MAX_QTY));
  }
  return [...seen].map(([id, qty]) => ({ id, qty }));
});

/** A list of product ids; bad entries are dropped. */
export const productIdList = (max: number) =>
  z.unknown().transform((input): string[] => {
    if (!Array.isArray(input)) return [];
    return input
      .filter((v): v is string => productId.safeParse(v).success)
      .slice(0, max);
  });

/* ---------- people ---------- */

const IDENTIFIER_MISSING =
  "Enter the email address or mobile number you shop with.";

/** An email or mobile typed to sign in, cleaned to what Caelinex expects. */
export const signInIdentifier = z
  .unknown()
  .transform((v) => cleanIdentifier(v))
  .pipe(z.string({ error: IDENTIFIER_MISSING }));

/** The six digits from a sign-in or change-of-contact code. */
export const signInCode = z
  .unknown()
  .transform((v) => String(v ?? "").replace(/\D/g, ""))
  .pipe(z.string().length(6, "Enter the six-digit code."));

export const EMAIL_HINT = "Enter an email address like name@example.com.";

/** An email: trimmed, lower-cased, at most 254 characters. */
export const emailAddress = (message = EMAIL_HINT) =>
  z
    .unknown()
    .transform((v) =>
      String(v ?? "")
        .trim()
        .toLowerCase(),
    )
    .pipe(z.string().max(254, message).refine(isEmail, message));

/** A mobile as typed, kept to digits, spaces and brackets, with its country code. */
export const mobileNumber = (message: string) =>
  z
    .unknown()
    .transform((v) => String(v ?? "").trim())
    .pipe(
      z
        .string()
        .refine(isPhone, message)
        .transform((s) => s.replace(/[\s()-]/g, "")),
    );

/** Text that is trimmed and capped; empty becomes undefined. */
export const clip = (max: number) =>
  z.unknown().transform(
    (v) =>
      String(v ?? "")
        .trim()
        .slice(0, max) || undefined,
  );
