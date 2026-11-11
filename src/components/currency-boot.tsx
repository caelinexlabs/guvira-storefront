"use client";

import { useEffect } from "react";
import type { Currency } from "@/lib/commerce/types";
import { useShop } from "@/lib/store/shop";

/** Hands the shop's currencies from the server to the browser store. */
export function CurrencyBoot({ currencies }: { currencies: Currency[] }) {
  const setCurrencies = useShop((s) => s.setCurrencies);
  const key = currencies.join();
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for the list
  useEffect(() => setCurrencies(currencies), [key, setCurrencies]);
  return null;
}
