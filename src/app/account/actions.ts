"use server";

import { redirect } from "next/navigation";
import {
  requestSignInCode,
  signOutEverywhere,
  signOutShopper,
  verifySignInCode,
} from "@/lib/caelinex/shopper";
import { clearSession, getSessionToken, setSessionToken } from "@/lib/session";
import { check, signInCode, signInIdentifier } from "@/lib/validation/schemas";

export type SignInState =
  | { step: "identify"; error?: string; identifier?: string }
  | { step: "code"; identifier: string; error?: string; resent?: boolean };

const NOT_CONNECTED =
  "Sign-in isn’t switched on yet. You can still shop and check out as a guest.";
const UNAVAILABLE =
  "We couldn’t reach our sign-in service. Try again in a minute.";

/**
 * Sign-in as a small state machine: "identify" (email or mobile) then "code".
 * One action handles every step; the form says which one with `intent`.
 */
export async function signIn(
  prev: SignInState,
  form: FormData,
): Promise<SignInState> {
  const intent = String(form.get("intent"));

  if (intent === "check" && prev.step === "code") {
    const code = check(signInCode, form.get("code"));
    if (!code.ok) return { ...prev, resent: false, error: code.message };
    const r = await verifySignInCode(prev.identifier, code.value);
    if (!r.ok)
      return {
        step: "code",
        identifier: prev.identifier,
        error:
          r.reason === "unauthorised" || r.reason === "invalid"
            ? "That code isn’t valid or has expired. Check it, or send a new one."
            : r.reason === "not-connected"
              ? NOT_CONNECTED
              : UNAVAILABLE,
      };
    await setSessionToken(r.value);
    redirect("/account");
  }

  if (intent === "change")
    return { step: "identify", identifier: prev.identifier };

  // "send" from the first step, or "resend" from the code step.
  const asked =
    intent === "resend" && prev.step === "code"
      ? { ok: true as const, value: prev.identifier }
      : check(signInIdentifier, form.get("identifier"));
  if (!asked.ok)
    return {
      step: "identify",
      identifier: String(form.get("identifier") ?? ""),
      error: asked.message,
    };
  const identifier = asked.value;
  const r = await requestSignInCode(identifier);
  if (!r.ok)
    return {
      step: "identify",
      identifier,
      error: r.reason === "not-connected" ? NOT_CONNECTED : UNAVAILABLE,
    };
  return { step: "code", identifier, resent: intent === "resend" };
}

export async function signOut() {
  const token = await getSessionToken();
  if (token) await signOutShopper(token);
  await clearSession();
  redirect("/");
}

export async function signOutAllDevices() {
  const token = await getSessionToken();
  if (token) await signOutEverywhere(token);
  await clearSession();
  redirect("/");
}
