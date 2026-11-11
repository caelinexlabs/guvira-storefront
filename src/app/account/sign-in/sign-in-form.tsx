"use client";

import { useActionState } from "react";
import { PillButton } from "@/components/ui";
import { type SignInState, signIn } from "../actions";

/** Who you are, then the code we sent. One action drives both steps. */
export function SignInForm() {
  const [state, act, pending] = useActionState<SignInState, FormData>(signIn, {
    step: "identify",
  });

  if (state.step === "code") {
    return (
      <form action={act} className="auth-form" noValidate>
        <p className="auth-lead">
          If <b>{state.identifier}</b> is on a Guvira account, a six-digit code
          is on its way. It expires in 10 minutes.
        </p>
        <label className="field">
          <span>Sign-in code</span>
          <input
            name="code"
            spellCheck={false}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="otp"
            aria-invalid={Boolean(state.error) || undefined}
            aria-describedby={state.error ? "code-error" : undefined}
          />
        </label>
        {state.error && (
          <p className="field-error" id="code-error" role="alert">
            {state.error}
          </p>
        )}
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
          {pending ? "Checking…" : "Sign in"}
        </PillButton>
        <div className="auth-alt">
          <button
            type="submit"
            name="intent"
            value="resend"
            className="text-btn"
            formNoValidate
            disabled={pending}
          >
            Send a new code
          </button>
          <button
            type="submit"
            name="intent"
            value="change"
            className="text-btn"
            formNoValidate
            disabled={pending}
          >
            Use a different email or number
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={act} className="auth-form" noValidate>
      <label className="field">
        <span>Email or mobile number</span>
        <input
          name="identifier"
          spellCheck={false}
          type="text"
          inputMode="email"
          autoComplete="username"
          defaultValue={state.identifier}
          required
          aria-invalid={Boolean(state.error) || undefined}
          aria-describedby={state.error ? "id-error id-hint" : "id-hint"}
        />
        <small id="id-hint">
          We’ll send a one-time code. No password needed.
        </small>
      </label>
      {state.error && (
        <p className="field-error" id="id-error" role="alert">
          {state.error}
        </p>
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
