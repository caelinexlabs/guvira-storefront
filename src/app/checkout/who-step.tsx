"use client";

import clsx from "clsx";
import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useShopConfig } from "@/components/shop-config";
import { PillButton } from "@/components/ui";
import type { Customer } from "@/lib/caelinex/shopper";
import { isEmail } from "@/lib/identity";
import { saveCartEmail } from "../cart/actions";
import { type AccountState, checkoutAccount } from "./actions";
import { describe, Field, REMINDER_NOTE } from "./field";

type Path = "account" | "guest";

/**
 * Step 1 for signed-out shoppers: an account (sign in or create one) or guest
 * checkout. Each path runs its own flow; both end by handing the details
 * step what they know.
 */
export function WhoStep({
  initialGuest,
  onAccount,
  onGuest,
}: {
  initialGuest?: { email: string; phone: string };
  onAccount: (c: Customer) => void;
  onGuest: (g: { email: string; phone: string }) => void;
}) {
  const [path, setPath] = useState<Path | undefined>(
    initialGuest ? "guest" : undefined,
  );
  return (
    <div className="who">
      <fieldset className="who-options">
        <legend className="vh">How to check out</legend>
        <Option
          on={path === "account"}
          onPick={() => setPath("account")}
          icon="user"
          title="Sign in or create an account"
          text="Track orders, save addresses and get members’ offers."
        />
        <Option
          on={path === "guest"}
          onPick={() => setPath("guest")}
          icon="bag"
          title="Continue as a guest"
          text="Just your email and mobile. You can make an account later."
        />
      </fieldset>
      {path === "account" && <AccountPanel onDone={onAccount} />}
      {path === "guest" && (
        <GuestPanel initial={initialGuest} onDone={onGuest} />
      )}
    </div>
  );
}

function Option({
  on,
  onPick,
  icon,
  title,
  text,
}: {
  on: boolean;
  onPick: () => void;
  icon: "user" | "bag";
  title: string;
  text: string;
}) {
  return (
    <label className={clsx("who-option", on && "on")}>
      <input
        type="radio"
        name="checkout-path"
        className="vh"
        checked={on}
        onChange={onPick}
      />
      <span className="ic">
        <Icon name={icon} />
      </span>
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <i className="tick" aria-hidden="true" />
    </label>
  );
}

function AccountPanel({ onDone }: { onDone: (c: Customer) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  return (
    <div className="who-panel">
      <div className="seg" role="tablist" aria-label="Account">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Each path keeps its own state; switching starts it fresh. */}
      <AccountFlow key={mode} mode={mode} onDone={onDone} />
    </div>
  );
}

function AccountFlow({
  mode,
  onDone,
}: {
  mode: "signin" | "signup";
  onDone: (c: Customer) => void;
}) {
  const [state, act, pending] = useActionState<AccountState, FormData>(
    checkoutAccount,
    { step: "form", mode },
  );

  // Hand over once, however often the parent re-renders.
  const handed = useRef(false);
  useEffect(() => {
    if (state.step !== "done" || handed.current) return;
    handed.current = true;
    onDone(state.customer);
  }, [state, onDone]);

  if (state.step === "done") return null;

  if (state.step === "code")
    return (
      <form action={act} className="who-form" noValidate>
        <input type="hidden" name="mode" value={mode} />
        <p className="who-lead">
          We’ve sent a six-digit code to <b>{state.identifier}</b>. It expires
          in 10 minutes.
        </p>
        <Field id="code" label="Code" error={state.error}>
          <input
            {...describe("code", state.error)}
            name="code"
            className="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            // biome-ignore lint/a11y/noAutofocus: the code field is the only thing to do on this step
            autoFocus
          />
        </Field>
        {state.resent && !state.error && (
          <output className="field-note">New code sent.</output>
        )}
        <PillButton
          tone="dark"
          className="wide"
          type="submit"
          name="intent"
          value="check"
          disabled={pending}
        >
          {pending
            ? "Checking…"
            : mode === "signup"
              ? "Create my account"
              : "Sign in and continue"}
        </PillButton>
        <div className="auth-alt">
          <button
            type="submit"
            name="intent"
            value="resend"
            className="text-btn"
            disabled={pending}
          >
            Send a new code
          </button>
          <button
            type="submit"
            name="intent"
            value="change"
            className="text-btn"
            disabled={pending}
          >
            {mode === "signup"
              ? "Change my details"
              : "Use a different email or number"}
          </button>
        </div>
      </form>
    );

  const v = state.values ?? {};
  return (
    <form action={act} className="who-form" noValidate>
      <input type="hidden" name="mode" value={mode} />
      {mode === "signin" ? (
        <Field
          id="identifier"
          label="Email or mobile number"
          hint="We’ll send a one-time code. No password needed."
          error={state.error}
        >
          <input
            {...describe("identifier", state.error, true)}
            name="identifier"
            defaultValue={v.identifier}
            inputMode="email"
            autoComplete="username"
            spellCheck={false}
          />
        </Field>
      ) : (
        <>
          <Field id="su-name" label="Full name">
            <input
              {...describe("su-name")}
              name="name"
              defaultValue={v.name}
              autoComplete="name"
            />
          </Field>
          <div className="co-row">
            <Field id="su-email" label="Email">
              <input
                {...describe("su-email")}
                name="email"
                type="email"
                defaultValue={v.email}
                autoComplete="email"
                spellCheck={false}
              />
            </Field>
            <Field id="su-phone" label="Mobile number">
              <input
                {...describe("su-phone")}
                name="phone"
                type="tel"
                defaultValue={v.phone}
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>
          </div>
          {state.error && (
            <p className="field-error" role="alert">
              {state.error}
            </p>
          )}
          <small className="field-note">
            We’ll send a code to your email to confirm it’s you.
          </small>
        </>
      )}
      <PillButton
        tone="dark"
        className="wide"
        type="submit"
        name="intent"
        value="send"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send my code"}
      </PillButton>
    </form>
  );
}

function GuestPanel({
  initial,
  onDone,
}: {
  initial?: { email: string; phone: string };
  onDone: (g: { email: string; phone: string }) => void;
}) {
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [tried, setTried] = useState(false);
  const { cartReminders } = useShopConfig();
  // Keep the address on the cart as soon as it is valid, not only after the
  // shopper presses Continue: someone who types it and leaves is who the
  // reminder is for.
  const typed = email.trim();
  useEffect(() => {
    if (!cartReminders || !isEmail(typed)) return;
    const t = setTimeout(() => void saveCartEmail(typed), 600);
    return () => clearTimeout(t);
  }, [cartReminders, typed]);
  const errors = {
    email: isEmail(email.trim())
      ? undefined
      : "Enter an email address like name@example.com.",
    phone:
      phone.replace(/\D/g, "").length >= 8
        ? undefined
        : "Enter a mobile number with at least 8 digits.",
  };
  return (
    <form
      className="who-panel who-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (errors.email) document.getElementById("co-g-email")?.focus();
        else if (errors.phone) document.getElementById("co-g-phone")?.focus();
        else onDone({ email: email.trim(), phone: phone.trim() });
      }}
    >
      <p className="who-lead">
        Your order confirmation and delivery updates go here.
      </p>
      <div className="co-row">
        <Field
          id="g-email"
          label="Email"
          hint={cartReminders ? REMINDER_NOTE : undefined}
          error={tried ? errors.email : undefined}
        >
          <input
            {...describe(
              "g-email",
              tried ? errors.email : undefined,
              cartReminders,
            )}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            spellCheck={false}
          />
        </Field>
        <Field
          id="g-phone"
          label="Mobile number"
          error={tried ? errors.phone : undefined}
        >
          <input
            {...describe("g-phone", tried ? errors.phone : undefined)}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>
      </div>
      <PillButton tone="dark" className="wide" type="submit">
        Continue as guest
      </PillButton>
    </form>
  );
}
