"use server";

import { revalidatePath } from "next/cache";
import {
  confirmContactChange,
  requestContactChange,
  updateShopperName,
} from "@/lib/caelinex/shopper";
import { isEmail, isPhone } from "@/lib/identity";
import { getSessionToken } from "@/lib/session";

const UNAVAILABLE = "We couldn’t reach our service. Try again in a minute.";

export type NameState = {
  saved?: boolean;
  error?: string;
  /** What was typed, so a mistake keeps the form. */
  values?: { firstName: string; lastName: string };
};

export async function saveName(
  _prev: NameState,
  form: FormData,
): Promise<NameState> {
  const token = await getSessionToken();
  if (!token) return { error: "Sign in again to change your details." };
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const values = { firstName, lastName };
  if (!firstName) return { error: "Enter your first name.", values };
  const r = await updateShopperName(token, { firstName, lastName });
  if (!r.ok) return { error: r.message ?? UNAVAILABLE, values };
  revalidatePath("/account", "layout");
  return { saved: true };
}

export type ContactKind = "email" | "phone";
export type ContactState =
  | { step: "enter"; error?: string; value?: string }
  | { step: "code"; value: string; error?: string; resent?: boolean }
  | { step: "done" };

const INVALID: Record<ContactKind, string> = {
  email: "Enter a valid email address.",
  phone: "Enter a mobile number with its country code.",
};

const clean = (kind: ContactKind, raw: unknown) => {
  const v = String(raw ?? "").trim();
  if (kind === "email") return isEmail(v) ? v.toLowerCase() : undefined;
  return isPhone(v) ? v.replace(/[\s()-]/g, "") : undefined;
};

/**
 * Change an email or mobile in two steps: a code goes to the new value, and the
 * change applies only when it comes back right. The kind rides in a hidden field.
 */
export async function changeContact(
  prev: ContactState,
  form: FormData,
): Promise<ContactState> {
  const token = await getSessionToken();
  const kind: ContactKind = form.get("kind") === "phone" ? "phone" : "email";
  if (!token)
    return { step: "enter", error: "Sign in again to change your details." };
  const intent = String(form.get("intent"));
  const to = (v: string) => (kind === "email" ? { email: v } : { phone: v });

  if (intent === "confirm" && prev.step === "code") {
    const code = String(form.get("code") ?? "").replace(/\D/g, "");
    if (code.length !== 6)
      return { ...prev, resent: false, error: "Enter the six-digit code." };
    const r = await confirmContactChange(token, to(prev.value), code);
    if (!r.ok)
      return {
        ...prev,
        resent: false,
        error:
          r.status === 409
            ? kind === "email"
              ? "That email is already on another account."
              : "That number is already on another account."
            : r.reason === "invalid" || r.reason === "unauthorised"
              ? "That code isn’t valid or has expired. Check it, or send a new one."
              : UNAVAILABLE,
      };
    revalidatePath("/account", "layout");
    return { step: "done" };
  }

  // "send" from the first step, or "resend" from the code step.
  const value =
    intent === "resend" && prev.step === "code"
      ? prev.value
      : clean(kind, form.get("value"));
  if (!value)
    return {
      step: "enter",
      value: String(form.get("value") ?? ""),
      error: INVALID[kind],
    };
  const r = await requestContactChange(token, to(value));
  if (!r.ok)
    return {
      step: "enter",
      value,
      error: r.status === 409 ? (r.message ?? UNAVAILABLE) : UNAVAILABLE,
    };
  return { step: "code", value, resent: intent === "resend" };
}
