"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { PillButton } from "@/components/ui";
import { type ContactKind, type ContactState, changeContact } from "./actions";

const COPY: Record<
  ContactKind,
  { label: string; field: string; type: string; auto: string; hint: string }
> = {
  email: {
    label: "Email",
    field: "New email address",
    type: "email",
    auto: "email",
    hint: "We’ll email a six-digit code to confirm it’s yours. Your current email works until you confirm. Orders placed under the old email stay under it and won’t show here.",
  },
  phone: {
    label: "Mobile",
    field: "New mobile number",
    type: "tel",
    auto: "tel",
    hint: "We’ll send a six-digit code to confirm it’s yours. Your current number works until you confirm.",
  },
};

/** One sign-in detail (email or mobile): its value, whether it is verified, and the change-by-code flow. */
export function ContactRow({
  kind,
  value,
  verified,
}: {
  kind: ContactKind;
  value?: string;
  verified?: boolean;
}) {
  const c = COPY[kind];
  const id = useId();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // When the form closes, focus goes back to the button that opened it.
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);
  const [state, act, pending] = useActionState<ContactState, FormData>(
    async (prev, form) => {
      const r = await changeContact(prev, form);
      if (r.step === "done") setOpen(false);
      return r;
    },
    { step: "enter" },
  );
  const reset = () => {
    setOpen(false);
  };

  return (
    <div className="acct-field">
      <dt>{c.label}</dt>
      <dd>
        {value ?? "Not added"}
        {value &&
          (verified ? (
            <small className="acct-ok">
              <Icon name="check" />
              Verified
            </small>
          ) : (
            <small className="acct-unverified">Not verified</small>
          ))}
      </dd>
      <button
        ref={trigger}
        type="button"
        className="text-btn"
        hidden={open}
        onClick={() => setOpen(true)}
      >
        {value ? "Change" : "Add"}
      </button>
      {open && (
        <form action={act} className="acct-edit" noValidate>
          <input type="hidden" name="kind" value={kind} />
          {state.step === "code" ? (
            <>
              <p className="auth-lead">
                A six-digit code is on its way to <b>{state.value}</b>. It
                expires in 10 minutes.
              </p>
              <label className="field">
                <span>Code</span>
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  spellCheck={false}
                  className="otp"
                  aria-invalid={Boolean(state.error) || undefined}
                  aria-describedby={state.error ? `${id}-err` : undefined}
                  // biome-ignore lint/a11y/noAutofocus: the step opens because the shopper asked for a code
                  autoFocus
                  required
                />
              </label>
              {state.error && (
                <p className="field-error" id={`${id}-err`} role="alert">
                  {state.error}
                </p>
              )}
              {state.resent && !state.error && (
                <output className="field-note">New code sent.</output>
              )}
              <div className="acct-edit-acts">
                <PillButton
                  tone="dark"
                  type="submit"
                  name="intent"
                  value="confirm"
                  disabled={pending}
                >
                  {pending ? "Checking…" : "Confirm"}
                </PillButton>
                <button
                  type="submit"
                  name="intent"
                  value="resend"
                  className="text-btn"
                  disabled={pending}
                >
                  Send a new code
                </button>
                <button type="button" className="text-btn" onClick={reset}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="field">
                <span>{c.field}</span>
                <input
                  name="value"
                  type={c.type}
                  autoComplete={c.auto}
                  defaultValue={state.step === "enter" ? state.value : ""}
                  aria-invalid={
                    (state.step === "enter" && Boolean(state.error)) ||
                    undefined
                  }
                  aria-describedby={
                    state.step === "enter" && state.error
                      ? `${id}-hint ${id}-err`
                      : `${id}-hint`
                  }
                  // biome-ignore lint/a11y/noAutofocus: the form opens because the shopper asked for it
                  autoFocus
                  required
                />
              </label>
              <p className="field-note" id={`${id}-hint`}>
                {c.hint}
              </p>
              {state.step === "enter" && state.error && (
                <p className="field-error" id={`${id}-err`} role="alert">
                  {state.error}
                </p>
              )}
              <div className="acct-edit-acts">
                <PillButton
                  tone="dark"
                  type="submit"
                  name="intent"
                  value="send"
                  disabled={pending}
                >
                  {pending ? "Sending…" : "Send code"}
                </PillButton>
                <button type="button" className="text-btn" onClick={reset}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
