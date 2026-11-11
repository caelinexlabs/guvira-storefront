"use client";

import { useState, useTransition } from "react";
import type { PromoCart } from "@/lib/caelinex/promo";
import { formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { applyPromo, removePromo } from "./promo-actions";

/**
 * A discount code on the order summary. Caelinex works out the discount, so
 * this only shows what it answers: the lines it took off, or why a code
 * didn't apply. Renders nothing until the bag is a Caelinex cart.
 */
export function PromoCode({
  onChange,
}: {
  onChange?: (cart: PromoCart | undefined) => void;
}) {
  const [code, setCode] = useState("");
  const [cart, setCart] = useState<PromoCart>();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const money = (n: number) =>
    formatMoney(n, (cart?.currency ?? "INR") as Currency);

  const run = (fn: () => ReturnType<typeof applyPromo>) =>
    start(async () => {
      setError(undefined);
      const r = await fn();
      if (r.status === "applied" || r.status === "removed") {
        const next = r.status === "applied" ? r.cart : undefined;
        setCart(next);
        onChange?.(next);
        if (r.status === "applied") setCode("");
      } else if (r.status === "rejected") setError(r.message);
      else if (r.status === "no-cart")
        setError("Your bag is still syncing. Try again in a moment.");
      else setError("We couldn’t check that code just now. Try again shortly.");
    });

  return (
    <div className="promo">
      {cart?.promoCode ? (
        <p className="promo-on">
          <span>
            <b>{cart.promoCode}</b> applied
            {cart.freeShipping ? " · free delivery" : ""}
          </span>
          <button
            type="button"
            className="text-btn"
            disabled={pending}
            onClick={() => run(removePromo)}
          >
            Remove
          </button>
        </p>
      ) : (
        <form
          className="promo-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => applyPromo(code));
          }}
        >
          <label className="vh" htmlFor="promo">
            Discount code
          </label>
          <input
            id="promo"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Discount code"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "promo-error" : undefined}
          />
          <button type="submit" disabled={pending || !code.trim()}>
            Apply
          </button>
        </form>
      )}
      {error && (
        <small className="field-error" id="promo-error" role="alert">
          {error}
        </small>
      )}
      {cart?.discounts.map((d) => (
        <p className="promo-line" key={`${d.name}-${d.code}`}>
          <span>{d.name}</span>
          <b>−{money(d.amount)}</b>
        </p>
      ))}
    </div>
  );
}
