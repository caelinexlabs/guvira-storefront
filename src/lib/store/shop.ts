"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Currency, Prices, ProductImage } from "@/lib/commerce/types";

// Bag, wishlist and currency live in the browser for now. When Caelinex has a
// cart API this store becomes a thin cache over it.

export type BagLine = {
  id: string;
  slug: string;
  name: string;
  line: string;
  image: ProductImage;
  prices: Prices;
  size?: string;
  qty: number;
};

type ShopState = {
  currency: Currency;
  /** What the shop sells in; set from the server on each page load. */
  currencies: Currency[];
  bag: BagLine[];
  wishlist: string[];
  bagOpen: boolean;
  setCurrency: (c: Currency) => void;
  setCurrencies: (list: Currency[]) => void;
  add: (item: Omit<BagLine, "qty">, qty?: number) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clearBag: () => void;
  toggleWish: (id: string) => boolean;
  openBag: (open: boolean) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      currency: "INR",
      currencies: ["INR"],
      bag: [],
      wishlist: [],
      bagOpen: false,
      setCurrency: (currency) => set({ currency }),
      // A remembered currency the shop no longer sells in falls back to its default.
      setCurrencies: (currencies) =>
        set((s) => ({
          currencies,
          currency: currencies.includes(s.currency)
            ? s.currency
            : (currencies[0] ?? s.currency),
        })),
      add: (item, qty = 1) =>
        set((s) => {
          const i = s.bag.findIndex(
            (l) => l.id === item.id && l.size === item.size,
          );
          if (i === -1) return { bag: [...s.bag, { ...item, qty }] };
          const bag = s.bag.slice();
          bag[i] = { ...bag[i], qty: bag[i].qty + qty };
          return { bag };
        }),
      setQty: (index, qty) =>
        set((s) => ({
          bag:
            qty <= 0
              ? s.bag.filter((_, i) => i !== index)
              : s.bag.map((l, i) => (i === index ? { ...l, qty } : l)),
        })),
      remove: (index) =>
        set((s) => ({ bag: s.bag.filter((_, i) => i !== index) })),
      clearBag: () => set({ bag: [] }),
      toggleWish: (id) => {
        const on = !get().wishlist.includes(id);
        set((s) => ({
          wishlist: on
            ? [...s.wishlist, id]
            : s.wishlist.filter((w) => w !== id),
        }));
        return on;
      },
      openBag: (bagOpen) => set({ bagOpen }),
    }),
    {
      name: "guvira.shop",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ currency, bag, wishlist }) => ({
        currency,
        bag,
        wishlist,
      }),
    },
  ),
);

export const bagCount = (bag: BagLine[]) => bag.reduce((n, l) => n + l.qty, 0);
