import { CURRENCIES, type Currency, type Prices } from "./types";

/**
 * The amount to show for a price in the shopper's currency. When the shop
 * hasn't priced it there, the shop's own currency is shown as it is: prices
 * are set by hand per currency and never converted.
 */
export function priceFor(prices: Prices, currency: Currency) {
  const own = prices[currency];
  if (own != null) return { amount: own, currency };
  const first = CURRENCIES.find((c) => prices[c] != null);
  return first
    ? { amount: prices[first] as number, currency: first }
    : { amount: 0, currency };
}

/** Totals for a set of lines, in each currency every line is priced in. */
export function totalPrices(lines: { prices: Prices; qty: number }[]): Prices {
  const out: Prices = {};
  for (const c of CURRENCIES)
    if (lines.length && lines.every((l) => l.prices[c] != null))
      out[c] = lines.reduce((s, l) => s + (l.prices[c] as number) * l.qty, 0);
  return out;
}
