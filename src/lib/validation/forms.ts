import { z } from "zod";
import { countryByCode } from "@/lib/checkout/countries";
import {
  addressId,
  clip,
  emailAddress,
  idempotencyKey,
  listingId,
  mobileNumber,
  orderLineId,
  orderToken,
  shortId,
  signInIdentifier,
} from "./schemas";

// What each server action accepts, one schema per form or call. Messages are
// the ones a shopper sees, so keep them plain and specific.

/* ---------- reviews and returns ---------- */

export const RETURN_REASON_CODES = [
  "DAMAGED",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "SIZE_FIT",
  "CHANGED_MIND",
  "OTHER",
] as const;

export const reviewInput = z.object({
  orderToken,
  listingId,
  rating: z
    .unknown()
    .transform((v) => Number.parseInt(String(v ?? ""), 10))
    .pipe(
      z
        .number("Choose a rating from one to five stars.")
        .int("Choose a rating from one to five stars.")
        .min(1, "Choose a rating from one to five stars.")
        .max(5, "Choose a rating from one to five stars."),
    ),
  title: clip(120),
  body: clip(2000),
});

const returnLine = z.object({
  orderLineId,
  quantity: z.number().int().min(1).max(99),
});

export const returnInput = z.object({
  orderToken,
  reason: z.enum(RETURN_REASON_CODES, "Choose why you are returning it."),
  note: clip(500),
  /** Lines that don't parse are dropped; none left is the error. */
  lines: z
    .unknown()
    .transform((input) =>
      Array.isArray(input)
        ? input.slice(0, 100).flatMap((l) => {
            const r = returnLine.safeParse(l);
            return r.success ? [r.data] : [];
          })
        : [],
    )
    .refine((l) => l.length > 0, "Choose the pieces you are returning."),
});

/* ---------- account ---------- */

const required = (message: string, max: number) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, "That is too long to save.");

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "That is too long to save.")
    .transform((v) => v || undefined)
    .optional();

export const nameInput = z.object({
  firstName: required("Enter your first name.", 60),
  lastName: z.string().trim().max(60, "That is too long to save."),
});

export const addressInput = z
  .object({
    name: required("Enter the name for this address.", 100),
    phone: optional(20),
    line1: required("Enter the first line of the address.", 200),
    line2: optional(200),
    city: required("Enter the city.", 100),
    region: optional(100),
    postalCode: z.string().trim().max(20, "That postal code is too long."),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .length(2, "Choose a country we ship to."),
    isDefault: z.boolean().optional(),
  })
  .superRefine((a, ctx) => {
    const c = countryByCode(a.country);
    const fail = (message: string, path: string) =>
      ctx.addIssue({ code: "custom", message, path: [path] });
    if (!c) return fail("Choose a country we ship to.", "country");
    if (c.regions && !a.region)
      return fail(
        `Choose a ${c.regionLabel?.toLowerCase() ?? "state"}.`,
        "region",
      );
    if (!a.postalCode)
      return fail(
        `Enter the ${c.postal?.label.toLowerCase() ?? "postal code"}.`,
        "postalCode",
      );
    if (c.postal && !c.postal.pattern.test(a.postalCode))
      return fail(
        `Check the ${c.postal.label.toLowerCase()}. It looks like ${c.postal.example}.`,
        "postalCode",
      );
  });

export { addressId };

export const contactInput = {
  email: emailAddress("Enter a valid email address."),
  phone: mobileNumber("Enter a mobile number with its country code."),
};

/** Creating an account at checkout: name, email and mobile. */
export const signUpInput = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Enter your full name."),
  email: emailAddress(),
  phone: z
    .string()
    .transform((s) => s.trim().replace(/[\s()-]/g, ""))
    .refine(
      (s) => s.length <= 20 && s.replace(/\D/g, "").length >= 8,
      "Enter a mobile number with at least 8 digits.",
    ),
});

/** Order tracking: the number on the order and how it was placed. */
export const trackInput = z.object({
  number: z
    .unknown()
    .transform((v) => String(v ?? "").replace(/\D/g, ""))
    .pipe(z.string().min(1).max(12)),
  contact: signInIdentifier,
});

export const TRACK_MISSING =
  "Enter your order number and the email or mobile you ordered with.";

/* ---------- cart and checkout ---------- */

export const promoInput = z
  .unknown()
  .transform((v) => String(v ?? "").replace(/\s+/g, ""))
  .pipe(z.string().min(1, "Enter your code.").max(40, "Enter your code."));

export const placeOrderInput = z.object({
  method: z.enum(["online", "cod"]),
  shippingRateId: shortId.optional(),
  idempotencyKey,
});

const tooLong = "That is too long.";

/** Caps on what a checkout form can hold; the rules themselves are in checkout/validate.ts. */
export const checkoutLimits = z.object({
  email: z.string().max(254, tooLong),
  phone: z.string().max(25, tooLong),
  fullName: z.string().max(100, tooLong),
  country: z.string().length(2, "Choose a country we ship to."),
  line1: z.string().max(200, tooLong),
  line2: z.string().max(200, tooLong),
  city: z.string().max(100, tooLong),
  region: z.string().max(100, tooLong),
  postal: z.string().max(20, tooLong),
});

export const deliveryQuery = z.object({
  country: z.string().length(2),
  region: z.string().max(100),
  postal: z.string().trim().max(20),
});
