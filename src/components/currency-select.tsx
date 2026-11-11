"use client";

import { Select } from "@base-ui/react/select";
import clsx from "clsx";
import { CURRENCY_META } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { useShop } from "@/lib/store/shop";
import { Icon } from "./icons";

const NAMES: Record<Currency, string> = {
  INR: "Indian rupee",
  USD: "US dollar",
  CAD: "Canadian dollar",
  AED: "UAE dirham",
  EUR: "Euro",
};

/** The brand's currency picker: a pill trigger and a soft card of options. */
export function CurrencySelect({ className }: { className?: string }) {
  const currency = useShop((s) => s.currency);
  const setCurrency = useShop((s) => s.setCurrency);
  const currencies = useShop((s) => s.currencies);
  // One currency means nothing to choose.
  if (currencies.length < 2) return null;
  const items = currencies.map((c) => ({
    value: c,
    label: CURRENCY_META[c].label,
  }));
  return (
    <Select.Root
      items={items}
      value={currency}
      onValueChange={(v) => v && setCurrency(v as Currency)}
      modal={false}
    >
      <Select.Trigger
        className={clsx("currency", className)}
        aria-label={`Currency, ${NAMES[currency]}`}
      >
        <Select.Value />
        <Select.Icon className="currency-caret">
          <Icon name="chev" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="currency-pos"
          sideOffset={8}
          align="end"
          alignItemWithTrigger={false}
        >
          <Select.Popup className="currency-pop">
            <Select.List>
              {currencies.map((c) => (
                <Select.Item key={c} value={c} className="currency-item">
                  <span className="currency-code">{c}</span>
                  <Select.ItemText className="currency-name">
                    {NAMES[c]}
                  </Select.ItemText>
                  <Select.ItemIndicator className="currency-tick">
                    <Icon name="check" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
