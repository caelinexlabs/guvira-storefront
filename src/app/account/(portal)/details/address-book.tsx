"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { PillButton } from "@/components/ui";
import type { ShopperAddress } from "@/lib/caelinex/shopper";
import { COUNTRIES, countryByCode } from "@/lib/checkout/countries";
import {
  type AddressState,
  makeDefaultAction,
  removeAddressAction,
  saveAddressAction,
} from "./address-actions";

const MAX = 10;

function AddressForm({
  address,
  first,
  onDone,
}: {
  address?: ShopperAddress;
  first: boolean;
  onDone: () => void;
}) {
  const [country, setCountry] = useState(address?.country ?? "IN");
  const c = countryByCode(country);
  const [state, act, pending] = useActionState<AddressState, FormData>(
    async (prev, form) => {
      const r = await saveAddressAction(prev, form);
      if (r.saved) onDone();
      return r;
    },
    {},
  );
  // What was typed comes back with an error, so a mistake keeps the form.
  const v = (key: string, saved?: string | null) =>
    state.values?.[key] ?? saved ?? "";
  return (
    <form action={act} className="acct-edit" noValidate>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="acct-edit-row">
        <label className="field">
          <span>Name</span>
          <input
            name="name"
            defaultValue={v("name", address?.name)}
            autoComplete="name"
            // biome-ignore lint/a11y/noAutofocus: the form opens because the shopper asked for it
            autoFocus
            required
          />
        </label>
        <label className="field">
          <span>Mobile for the courier</span>
          <input
            name="phone"
            type="tel"
            defaultValue={v("phone", address?.phone)}
            autoComplete="tel"
          />
        </label>
      </div>
      <label className="field">
        <span>Address</span>
        <input
          name="line1"
          defaultValue={v("line1", address?.line1)}
          autoComplete="address-line1"
          required
        />
      </label>
      <label className="field">
        <span>Apartment, landmark (optional)</span>
        <input
          name="line2"
          defaultValue={v("line2", address?.line2)}
          autoComplete="address-line2"
        />
      </label>
      <div className="acct-edit-row">
        <label className="field">
          <span>City</span>
          <input
            name="city"
            defaultValue={v("city", address?.city)}
            autoComplete="address-level2"
            required
          />
        </label>
        <label className="field">
          <span>{c?.postal?.label ?? "Postal code"}</span>
          <input
            name="postalCode"
            defaultValue={v("postalCode", address?.postalCode)}
            autoComplete="postal-code"
            required
          />
        </label>
      </div>
      <div className="acct-edit-row">
        <label className="field">
          <span>Country</span>
          <select
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRIES.map((k) => (
              <option key={k.code} value={k.code}>
                {k.name}
              </option>
            ))}
          </select>
        </label>
        {c?.regions ? (
          <label className="field" key={`${country}-select`}>
            <span>{c.regionLabel ?? "State"}</span>
            <select name="region" defaultValue={v("region", address?.region)}>
              <option value="">Choose</option>
              {c.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="field" key={`${country}-text`}>
            <span>{c?.regionLabel ?? "State or region"}</span>
            <input
              name="region"
              defaultValue={v("region", address?.region)}
              autoComplete="address-level1"
            />
          </label>
        )}
      </div>
      {!first && !address?.isDefault && (
        <label className="acct-check">
          <input type="checkbox" name="isDefault" />
          Use as my default address
        </label>
      )}
      {state.error && (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="acct-edit-acts">
        <PillButton tone="dark" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </PillButton>
        <button type="button" className="text-btn" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** The shopper's saved delivery addresses: add, change, pick the default, remove. */
export function AddressBook({ addresses }: { addresses: ShopperAddress[] }) {
  // "new", an address id being edited, or nothing.
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const addRef = useRef<HTMLButtonElement>(null);
  const done = () => {
    setEditing(null);
    // The form that opened is gone; put focus back where the shopper was.
    queueMicrotask(() => addRef.current?.focus());
  };

  return (
    <div className="acct-addrs">
      {addresses.length === 0 && editing !== "new" && (
        <p className="acct-sub">
          No saved addresses yet. Add one to keep it handy.
        </p>
      )}
      <ul className="acct-agrid">
        {addresses.map((a) => (
          <li key={a.id} className="acct-addr">
            {editing === a.id ? (
              <AddressForm
                address={a}
                first={addresses.length === 1}
                onDone={done}
              />
            ) : (
              <>
                {a.isDefault && <span className="acct-badge">Default</span>}
                <address>
                  <b>{a.name}</b>
                  <span>
                    {[a.line1, a.line2].filter(Boolean).join(", ")}
                    <br />
                    {[a.city, a.region, a.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                    <br />
                    {countryByCode(a.country)?.name ?? a.country}
                    {a.phone ? ` · ${a.phone}` : ""}
                  </span>
                </address>
                <div className="acct-addr-acts">
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setEditing(a.id)}
                  >
                    Change
                  </button>
                  {!a.isDefault && (
                    <button
                      type="button"
                      className="text-btn"
                      disabled={busy}
                      onClick={() => start(() => makeDefaultAction(a.id))}
                    >
                      Make default
                    </button>
                  )}
                  {confirming === a.id ? (
                    <>
                      <button
                        type="button"
                        className="text-btn"
                        disabled={busy}
                        onClick={() =>
                          start(async () => {
                            await removeAddressAction(a.id);
                            setConfirming(null);
                          })
                        }
                      >
                        Yes, remove
                      </button>
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => setConfirming(null)}
                      >
                        Keep it
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="text-btn is-quiet"
                      onClick={() => setConfirming(a.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {editing === "new" ? (
        <AddressForm first={addresses.length === 0} onDone={done} />
      ) : (
        addresses.length < MAX && (
          <button
            ref={addRef}
            type="button"
            className="acct-ghost"
            onClick={() => setEditing("new")}
          >
            Add an address
          </button>
        )
      )}
    </div>
  );
}
