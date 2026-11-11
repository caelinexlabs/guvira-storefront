"use client";

import clsx from "clsx";
import { Icon } from "@/components/icons";
import { useShopConfig } from "@/components/shop-config";
import {
  methodAvailable,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/checkout/payment";

/** Pay online (Razorpay's window) or cash on delivery. */
export function PaymentStep({
  country,
  method,
  onMethod,
}: {
  country: string;
  method: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
}) {
  const { cashOnDelivery } = useShopConfig();
  const methods = PAYMENT_METHODS.filter(
    (m) => m.id !== "cod" || cashOnDelivery,
  );
  return (
    <div className="pay">
      <fieldset className="pay-methods">
        <legend className="vh">Payment method</legend>
        {methods.map((m) => {
          const ok = methodAvailable(m.id, country);
          return (
            <label
              key={m.id}
              className={clsx(
                "pay-method",
                method === m.id && "on",
                !ok && "off",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                className="vh"
                checked={method === m.id}
                disabled={!ok}
                onChange={() => onMethod(m.id)}
              />
              <b>{m.label}</b>
              <small>{ok ? m.note : "For delivery in India only"}</small>
            </label>
          );
        })}
      </fieldset>

      <div className="pay-panel" aria-live="polite">
        {method === "online" ? (
          <p className="pay-safe">
            <Icon name="shield" />
            You’ll pay in Razorpay’s secure window. Guvira never sees or stores
            your card or UPI details.
          </p>
        ) : (
          <div className="pay-cod">
            <Icon name="box" />
            <p>
              Pay in cash when your order is delivered. Nothing is charged now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
