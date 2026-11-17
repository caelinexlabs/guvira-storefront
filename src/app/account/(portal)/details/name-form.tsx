"use client";

import { useActionState, useState } from "react";
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
  const [open, setOpen] = useState(false);
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
      {!open && (
        <button
          type="button"
          className="text-btn"
          onClick={() => setOpen(true)}
        >
          Edit
        </button>
      )}
      {open && (
        <form action={act} className="acct-edit" noValidate>
          <div className="acct-edit-row">
            <label className="field">
              <span>First name</span>
              <input
                name="firstName"
                defaultValue={firstName ?? name.split(" ")[0]}
                autoComplete="given-name"
                required
              />
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                name="lastName"
                defaultValue={lastName ?? name.split(" ").slice(1).join(" ")}
                autoComplete="family-name"
              />
            </label>
          </div>
          {state.error && (
            <p className="field-error" role="alert">
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
