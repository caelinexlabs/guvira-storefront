"use client";

import type { Currency } from "@/lib/commerce/types";
import type { BagLine } from "@/lib/store/shop";
import type { CheckoutDetails } from "./validate";

// What checkout keeps in this tab between pages: the half-done checkout (so a
// failed payment returns the shopper to the payment step with everything
// filled in) and the last placed order (for the confirmation page). Card
// details are never stored. Everything here is per-tab and short-lived.

export type CheckoutDraft = {
  who: "account" | "guest";
  details: CheckoutDetails;
  done: ("who" | "details" | "delivery")[];
};

export type PlacedOrder = {
  number: string;
  /** The order's own token, for looking it up later. */
  token?: string;
  placedAt: string;
  email: string;
  phone: string;
  name: string;
  address: string[];
  payment: string;
  cod: boolean;
  lines: BagLine[];
  currency: Currency;
  total: number;
};

/** An order waiting for payment: the attempt key, and the bag it was made for. */
export type PendingPayment = {
  key: string;
  bag: string;
  /** What the order came to, for the Pay button when the page reopens. */
  total: number;
  currency: Currency;
};

const KEYS = {
  draft: "guvira.checkout",
  pending: "guvira.pending-payment",
  order: "guvira.order",
} as const;

function read<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === undefined) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full: the flow still works, it just won't resume.
  }
}

export const loadDraft = () => read<CheckoutDraft>(KEYS.draft);
export const saveDraft = (d: CheckoutDraft | undefined) => write(KEYS.draft, d);
export const loadOrder = () => read<PlacedOrder>(KEYS.order);
export const saveOrder = (o: PlacedOrder) => write(KEYS.order, o);
export const loadPending = () => read<PendingPayment>(KEYS.pending);
export const savePending = (p: PendingPayment | undefined) =>
  write(KEYS.pending, p);
