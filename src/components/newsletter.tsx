"use client";

import { useActionState, useEffect, useRef } from "react";
import { type NewsletterState, subscribe } from "@/app/newsletter/actions";
import { PillButton, PillLink } from "./ui";

/**
 * New-drop emails. With no list to send to (`open` false) it says so and
 * points to Instagram instead of pretending to sign anyone up.
 */
export function Newsletter({
  open,
  heading,
  text,
  instagram,
}: {
  open: boolean;
  instagram?: string;
  heading: string;
  text: string;
}) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribe,
    { status: "idle" },
  );
  const error = state.status === "error" ? state : undefined;
  const input = useRef<HTMLInputElement>(null);

  // Send the shopper back to the field when it needs fixing.
  useEffect(() => {
    if (state.status === "error") input.current?.focus();
  }, [state]);

  return (
    <div className="news">
      {heading && <h2 className="news-heading">{heading}</h2>}
      {!open ? (
        <>
          <p>
            Email sign-ups open soon. Until then, new pieces and restocks land
            first on Instagram.
          </p>
          {instagram && (
            <PillLink href={instagram} target="_blank" rel="noopener">
              Follow on Instagram
            </PillLink>
          )}
        </>
      ) : state.status === "done" ? (
        <output className="news-done">
          <b>You’re on the list.</b> We’ll email you when new pieces land.
        </output>
      ) : (
        <>
          {text && <p>{text}</p>}
          <form action={action} noValidate>
            <label className="vh" htmlFor="news-email">
              Email
            </label>
            <input
              ref={input}
              id="news-email"
              name="email"
              type="email"
              placeholder="you@example.com…"
              spellCheck={false}
              autoComplete="email"
              defaultValue={error?.email}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "news-error" : undefined}
              required
            />
            <PillButton tone="dark" type="submit" pending={pending}>
              {pending ? "Subscribing…" : "Subscribe"}
            </PillButton>
          </form>
          {error && (
            <output id="news-error" className="news-error">
              {error.message}
            </output>
          )}
        </>
      )}
    </div>
  );
}
