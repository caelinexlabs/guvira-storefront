"use server";

import { subscribeToNewsletter } from "@/lib/caelinex/shopper";
import { check, emailAddress } from "@/lib/validation/schemas";

export type NewsletterState =
  | { status: "idle" }
  | { status: "done" }
  | { status: "error"; message: string; email: string };

export async function subscribe(
  _prev: NewsletterState,
  form: FormData,
): Promise<NewsletterState> {
  const typed = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const parsed = check(emailAddress(), typed);
  if (!parsed.ok)
    return { status: "error", email: typed, message: parsed.message };
  const email = parsed.value;
  const r = await subscribeToNewsletter(email);
  if (r.ok) return { status: "done" };
  return {
    status: "error",
    email,
    message:
      r.reason === "not-connected"
        ? "Sign-ups aren’t open yet. Follow us on Instagram for new pieces."
        : "We couldn’t add you just now. Try again in a moment.",
  };
}
