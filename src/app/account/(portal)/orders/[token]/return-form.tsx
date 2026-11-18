"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { PillButton } from "@/components/ui";
import { askForReturn, type ReturnState } from "./actions";

type Line = {
  orderLineId: string;
  name: string;
  variantName: string | null;
  quantity: number;
};

/** Pick the pieces and a reason; the shop decides. Closed until asked for. */
export function ReturnForm({
  orderToken,
  lines,
  reasons,
  endsAt,
}: {
  orderToken: string;
  lines: Line[];
  reasons: { code: string; label: string }[];
  endsAt: string | null;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [state, act, pending] = useActionState<ReturnState, FormData>(
    async (prev, form) => {
      const r = await askForReturn(orderToken, prev, form);
      if (r.done) setOpen(false);
      return r;
    },
    {},
  );
  // Focus goes back to the button that opened the form.
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="ord-return">
      <button
        ref={trigger}
        type="button"
        className="acct-ghost"
        hidden={open}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Return a piece
      </button>
      {endsAt && !open && (
        <p className="ord-return-note">
          You can ask until{" "}
          {new Date(endsAt).toLocaleDateString("en-GB", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          .
        </p>
      )}
      {open && (
        <form action={act} className="acct-edit" noValidate>
          <fieldset className="ord-return-lines">
            <legend>Which pieces?</legend>
            {lines.map((l) => {
              const control = `${id}-${l.orderLineId}`;
              const counts: number[] = [];
              for (let n = 0; n <= l.quantity; n++) counts.push(n);
              return (
                <div key={l.orderLineId} className="ord-return-line">
                  <label htmlFor={control}>
                    <b>{l.name}</b>
                    {l.variantName && <small>{l.variantName}</small>}
                  </label>
                  {l.quantity > 1 ? (
                    <select
                      id={control}
                      name={`qty:${l.orderLineId}`}
                      defaultValue={state.values?.qty[l.orderLineId] ?? "0"}
                    >
                      {counts.map((n) => (
                        <option key={n} value={n}>
                          {n === 0 ? "None" : n}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={control}
                      type="checkbox"
                      name={`qty:${l.orderLineId}`}
                      value="1"
                      defaultChecked={Boolean(state.values?.qty[l.orderLineId])}
                    />
                  )}
                </div>
              );
            })}
          </fieldset>
          <label className="field">
            <span>Why are you returning it?</span>
            <select
              name="reason"
              defaultValue={state.values?.reason ?? ""}
              aria-describedby={state.error ? `${id}-err` : undefined}
              // biome-ignore lint/a11y/noAutofocus: the form opens because the shopper asked for it
              autoFocus
            >
              <option value="">Choose</option>
              {reasons.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Anything we should know? (optional)</span>
            <textarea
              name="note"
              rows={3}
              maxLength={500}
              defaultValue={state.values?.note ?? ""}
            />
          </label>
          {state.error && (
            <p className="field-error" id={`${id}-err`} role="alert">
              {state.error}
            </p>
          )}
          <div className="acct-edit-acts">
            <PillButton tone="dark" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send request"}
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
