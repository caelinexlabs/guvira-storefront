"use server";

import { checkoutCart } from "@/lib/caelinex/cart";
import { forgetCart, syncCart } from "@/lib/caelinex/cart-sync";
import {
  type Customer,
  getCustomer,
  requestSignInCode,
  verifySignInCode,
} from "@/lib/caelinex/shopper";
import { regionCode } from "@/lib/checkout/gst-state";
import type { PaymentMethod } from "@/lib/checkout/payment";
import {
  type CheckoutDetails,
  type FieldErrors,
  validateDetails,
} from "@/lib/checkout/validate";
import { cleanIdentifier, isEmail } from "@/lib/identity";
import { getCartToken, setSessionToken } from "@/lib/session";

/* ---------- Step 1: sign in or create an account, without leaving checkout ---------- */

export type AccountState =
  | {
      step: "form";
      mode: "signin" | "signup";
      error?: string;
      values?: Record<string, string>;
    }
  | {
      step: "code";
      mode: "signin" | "signup";
      identifier: string;
      profile?: Customer;
      error?: string;
      resent?: boolean;
    }
  | { step: "done"; customer: Customer };

const NOT_CONNECTED =
  "Accounts aren’t switched on yet. You can check out as a guest instead.";
const UNAVAILABLE = "We couldn’t reach our account service. Try again shortly.";

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

/**
 * One action drives both account paths. Signing in asks for an email or
 * mobile; creating an account asks for name, email and mobile. Both then
 * confirm a one-time code, after which the shopper is signed in and the
 * details step fills itself in.
 */
export async function checkoutAccount(
  prev: AccountState,
  form: FormData,
): Promise<AccountState> {
  const intent = text(form, "intent");
  const mode = text(form, "mode") === "signup" ? "signup" : "signin";

  if (intent === "change" && prev.step === "code")
    return { step: "form", mode: prev.mode };

  if (intent === "check" && prev.step === "code") {
    const code = text(form, "code").replace(/\D/g, "");
    if (code.length !== 6)
      return { ...prev, resent: false, error: "Enter the six-digit code." };
    const r = await verifySignInCode(prev.identifier, code);
    if (!r.ok)
      return {
        ...prev,
        resent: false,
        error:
          r.reason === "invalid" || r.reason === "unauthorised"
            ? "That code didn’t match or has expired. Check it, or send a new one."
            : r.reason === "not-connected"
              ? NOT_CONNECTED
              : UNAVAILABLE,
      };
    await setSessionToken(r.value);
    const me = await getCustomer(r.value);
    const customer: Customer = me.ok
      ? {
          ...me.value,
          name: me.value.name || prev.profile?.name || "",
        }
      : (prev.profile ?? { name: "" });
    return { step: "done", customer };
  }

  if (intent === "resend" && prev.step === "code") {
    const r = prev.profile
      ? await requestSignInCode(prev.profile.email ?? prev.profile.phone ?? "")
      : await requestSignInCode(prev.identifier);
    return r.ok
      ? { ...prev, error: undefined, resent: true }
      : { ...prev, resent: false, error: UNAVAILABLE };
  }

  // "send": the first form of either path.
  if (mode === "signin") {
    const identifier = cleanIdentifier(form.get("identifier"));
    const values = { identifier: text(form, "identifier") };
    if (!identifier)
      return {
        step: "form",
        mode,
        values,
        error: "Enter the email address or mobile number you shop with.",
      };
    const r = await requestSignInCode(identifier);
    if (!r.ok)
      return {
        step: "form",
        mode,
        values,
        error: r.reason === "not-connected" ? NOT_CONNECTED : UNAVAILABLE,
      };
    return { step: "code", mode, identifier };
  }

  const values = {
    name: text(form, "name"),
    email: text(form, "email").toLowerCase(),
    phone: text(form, "phone").replace(/[\s()-]/g, ""),
  };
  const error =
    values.name.length < 2
      ? "Enter your full name."
      : !isEmail(values.email)
        ? "Enter an email address like name@example.com."
        : values.phone.replace(/\D/g, "").length < 8
          ? "Enter a mobile number with at least 8 digits."
          : undefined;
  if (error) return { step: "form", mode, values, error };
  const profile: Customer = values;
  const r = await requestSignInCode(values.email);
  if (!r.ok)
    return {
      step: "form",
      mode,
      values,
      error: r.reason === "not-connected" ? NOT_CONNECTED : UNAVAILABLE,
    };
  return {
    step: "code",
    mode,
    identifier: values.email,
    profile,
  };
}

/* ---------- Placing the order ---------- */

export type OrderLine = { id: string; qty: number };

export type PlaceOrderResult =
  | { status: "invalid"; errors: FieldErrors }
  | { status: "bag-changed"; message: string }
  | { status: "retry" } // Caelinex didn't answer: the same attempt can be repeated
  | {
      status: "created";
      orderNumber: string;
      token: string;
      currency: string;
      total: number;
    }
  | {
      /** Online payment: open Razorpay's window with these details. */
      status: "pay";
      orderNumber: string;
      token: string;
      currency: string;
      total: number;
      payment: {
        keyId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
      };
    };

/**
 * The real guard for an order. Details are re-validated here, the cart is
 * brought in line with the bag, and Caelinex then prices it, checks stock and
 * places the order. Prices from the browser are never trusted. Online orders
 * come back with the details for Razorpay's window; the cart is kept until the
 * payment is confirmed, so a closed window can be reopened with the same key.
 */
export async function placeOrder(
  details: CheckoutDetails,
  lines: OrderLine[],
  method: PaymentMethod,
  shippingRateId: string | undefined,
  idempotencyKey: string,
  /** The same attempt again (a closed payment window): Caelinex replays the order. */
  replay = false,
): Promise<PlaceOrderResult> {
  const errors = validateDetails(details);
  if (Object.keys(errors).length) return { status: "invalid", errors };
  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 8)
    return { status: "retry" };

  // A replay reuses the cart that is already checked out, so it skips the
  // stock check (which would now fail) and lets Caelinex answer with the same
  // order and payment details.
  let cartToken: string | undefined;
  if (replay) {
    cartToken = await getCartToken();
    if (!cartToken) return { status: "retry" };
  } else {
    const synced = await syncCart(lines);
    if (synced.status === "empty")
      return { status: "bag-changed", message: "Your bag is empty." };
    if (synced.status !== "ok") return { status: "retry" };
    if (synced.problems.length || !synced.cart.canCheckout)
      return {
        status: "bag-changed",
        message:
          synced.problems[0]?.message ??
          "Something in your bag isn’t available right now. Check your bag and try again.",
      };
    cartToken = synced.token;
  }

  const name = details.fullName.trim();
  const r = await checkoutCart(
    cartToken,
    {
      email: details.email.trim(),
      name,
      phone: details.phone.trim(),
      shippingAddress: {
        name,
        line1: details.line1.trim(),
        line2: details.line2.trim() || undefined,
        city: details.city.trim(),
        region: regionCode(details.country, details.region) || undefined,
        postalCode: details.postal.trim(),
        country: details.country,
        phone: details.phone.trim(),
      },
      shippingRateId,
      paymentMethod: method === "cod" ? "COD" : "RAZORPAY",
    },
    idempotencyKey,
  );
  if (!r.ok)
    return r.reason === "invalid"
      ? {
          status: "bag-changed",
          message: r.message ?? "We couldn’t place that order. Try again.",
        }
      : { status: "retry" };

  const placed = {
    orderNumber: String(r.value.orderNumber),
    token: r.value.token,
    currency: r.value.currency,
    total: r.value.total,
  };
  if (method === "online") {
    if (!r.value.payment) return { status: "retry" };
    return { status: "pay", ...placed, payment: r.value.payment };
  }
  await forgetCart();
  return { status: "created", ...placed };
}
