"use client";

import { useActionState } from "react";
import { describe, Field } from "@/app/checkout/field";
import { OrderView } from "@/components/order-view";
import { PillButton } from "@/components/ui";
import { type TrackState, trackOrder } from "../actions";

/** Order number plus email or mobile in; status, parcels and history out. */
export function TrackForm() {
  const [state, act, pending] = useActionState<TrackState, FormData>(
    trackOrder,
    { step: "form" },
  );

  if (state.step === "found") return <OrderView order={state.order} />;

  const v = state.values ?? {};
  return (
    <form className="co-form track-form" action={act} noValidate>
      <Field
        id="number"
        label="Order number"
        hint="In your confirmation email."
      >
        <input
          {...describe("number", undefined, true)}
          name="number"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={v.number}
        />
      </Field>
      <Field
        id="contact"
        label="Email or mobile"
        hint="The one you ordered with."
        error={state.error}
      >
        <input
          {...describe("contact", state.error, true)}
          name="contact"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={v.contact}
        />
      </Field>
      <PillButton tone="dark" className="wide" type="submit" disabled={pending}>
        {pending ? "Looking…" : "Track order"}
      </PillButton>
    </form>
  );
}
