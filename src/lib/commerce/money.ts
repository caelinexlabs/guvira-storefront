import type { Currency } from "./types";

export const CURRENCY_META: Record<
  Currency,
  { label: string; locale: string }
> = {
  INR: { label: "INR ₹", locale: "en-IN" },
  USD: { label: "USD $", locale: "en-US" },
  CAD: { label: "CAD $", locale: "en-CA" },
  AED: { label: "AED", locale: "en-AE" },
  EUR: { label: "EUR €", locale: "de-DE" },
};

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(CURRENCY_META[currency].locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
