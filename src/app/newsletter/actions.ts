"use server";

import { subscribeToNewsletter } from "@/lib/caelinex/shopper";
import { isEmail } from "@/lib/identity";

export type NewsletterState =
  | { status: "idle" }
  | { status: "done" }
  | { status: "error"; message: string; email: string };

export async function subscribe(
  _prev: NewsletterState,
  form: FormData,
): Promise<NewsletterState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!isEmail(email))
    return {
      status: "error",
      email,
      message: "Enter an email address like name@example.com.",
    };
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
