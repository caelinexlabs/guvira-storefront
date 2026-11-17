"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { PillButton } from "@/components/ui";
import { type NameState, saveName } from "./actions";

/** The name on the account: shown, then a small form when "Edit" is pressed. */
export function NameForm({
  firstName,
  lastName,
  name,
}: {
  firstName?: string;
  lastName?: string;
  name: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // When the form closes, focus goes back to the button that opened it.
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);
  const [state, act, pending] = useActionState<NameState, FormData>(
    async (prev, form) => {
      const r = await saveName(prev, form);
      if (r.saved) setOpen(false);
      return r;
    },
    {},
  );

  return (
    <div className="acct-field">
      <dt>Name</dt>
      <dd>{name || "Not added"}</dd>
      <button
        ref={trigger}
        type="button"
        className="text-btn"
        hidden={open}
        onClick={() => setOpen(true)}
      >
        Change
      </button>
      {open && (
        <form action={act} className="acct-edit" noValidate>
          <div className="acct-edit-row">
            <label className="field">
              <span>First name</span>
              <input
                name="firstName"
                defaultValue={
                  state.values?.firstName ?? firstName ?? name.split(" ")[0]
                }
                autoComplete="given-name"
                aria-invalid={Boolean(state.error) || undefined}
                aria-describedby={state.error ? `${id}-err` : undefined}
                // biome-ignore lint/a11y/noAutofocus: the form opens because the shopper asked for it
                autoFocus
                required
              />
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                name="lastName"
                defaultValue={
                  state.values?.lastName ??
                  lastName ??
                  name.split(" ").slice(1).join(" ")
                }
                autoComplete="family-name"
              />
            </label>
          </div>
          {state.error && (
            <p className="field-error" id={`${id}-err`} role="alert">
              {state.error}
            </p>
          )}
          <div className="acct-edit-acts">
            <PillButton tone="dark" type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </PillButton>
            <button
              type="button"
              className="text-btn"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
