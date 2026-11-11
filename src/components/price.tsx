"use client";

import NumberFlow from "@number-flow/react";
import { CURRENCY_META } from "@/lib/commerce/money";
import { priceFor } from "@/lib/commerce/price";
import type { Prices } from "@/lib/commerce/types";
import { useShop } from "@/lib/store/shop";

/** A price in the shopper's currency. Digits roll when the currency changes. */
export function Price({
  prices,
  qty = 1,
  className,
}: {
  prices: Prices;
  qty?: number;
  className?: string;
}) {
  const wanted = useShop((s) => s.currency);
  const { amount, currency } = priceFor(prices, wanted);
  if (!Object.keys(prices).length)
    return (
      <span className={`${className ?? ""} price-soon`.trim()}>
        Price coming soon
      </span>
    );
  return (
    <NumberFlow
      className={className}
      value={amount * qty}
      locales={CURRENCY_META[currency].locale}
      format={{ style: "currency", currency, maximumFractionDigits: 0 }}
    />
  );
}
