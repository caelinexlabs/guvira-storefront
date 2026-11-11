"use server";

import { syncCart, type WantedLine } from "@/lib/caelinex/cart-sync";
import { getServiceability, getShippingQuote } from "@/lib/caelinex/shipping";
import { countryByCode } from "@/lib/checkout/countries";
import { regionCode } from "@/lib/checkout/gst-state";

export type DeliveryCheck =
  | { status: "ok"; minDays: number | null; maxDays: number | null }
  | { status: "no-service" }
  | { status: "free-form" } // the shop has no zones: we can't promise a date
  | { status: "bad-code"; message: string }
  | { status: "unavailable" };

/** Product page: do we deliver to this postcode? Works with no cart. */
export async function checkDelivery(
  country: string,
  postal: string,
): Promise<DeliveryCheck> {
  const c = countryByCode(country);
  const code = postal.trim();
  if (!c) return { status: "bad-code", message: "Choose a country first." };
  if (c.postal && !c.postal.pattern.test(code))
    return {
      status: "bad-code",
      message: `Enter a valid ${c.postal.label}${c.postal.example ? `, like ${c.postal.example}` : ""}.`,
    };
  const r = await getServiceability(country, code);
  if (!r.ok) return { status: "unavailable" };
  if (!r.value.required) return { status: "free-form" };
  if (!r.value.serviceable) return { status: "no-service" };
  return {
    status: "ok",
    minDays: r.value.minDays,
    maxDays: r.value.maxDays,
  };
}

export type RateOption = {
  id: string;
  name: string;
  amount: number;
  free: boolean;
  freeAbove: number | null;
  minDays: number | null;
  maxDays: number | null;
  /** ISO dates, calendar days from today. */
  from?: string;
  to?: string;
};

export type DeliveryQuote =
  | { status: "rates"; rates: RateOption[] }
  | { status: "none-needed" } // no zones set up: delivery isn't charged
  | { status: "no-service" }
  | { status: "no-cart" } // the bag isn't a Caelinex cart yet
  | { status: "unavailable" };

/** Checkout: delivery options and prices for the bag at this address. */
export async function quoteDelivery(
  address: { country: string; region: string; postal: string },
  lines: WantedLine[],
): Promise<DeliveryQuote> {
  // The quote is for the cart, so make the cart match the bag first.
  const synced = await syncCart(lines);
  if (synced.status !== "ok") return { status: "no-cart" };
  const token = synced.token;
  const r = await getShippingQuote(token, {
    country: address.country,
    region: regionCode(address.country, address.region),
    postalCode: address.postal.trim(),
  });
  if (!r.ok)
    return { status: r.reason === "not-connected" ? "no-cart" : "unavailable" };
  if (!r.value.required) return { status: "none-needed" };
  if (!r.value.serviceable || r.value.rates.length === 0)
    return { status: "no-service" };
  return {
    status: "rates",
    rates: r.value.rates.map((x) => ({
      id: x.id,
      name: x.name,
      amount: x.amount,
      free: x.free,
      freeAbove: x.freeAbove,
      minDays: x.minDays,
      maxDays: x.maxDays,
      from: x.estimatedDelivery?.from,
      to: x.estimatedDelivery?.to,
    })),
  };
}
