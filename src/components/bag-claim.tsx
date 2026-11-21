"use client";

import { useEffect, useRef } from "react";
import { claimBag } from "@/app/cart/actions";
import { useShop } from "@/lib/store/shop";

/** Joins this browser's bag to the one saved on the shopper's account. */
export async function claimIntoBag() {
  const before = useShop.getState().bag;
  const r = await claimBag();
  if (r.status !== "ok" || r.lines.length === 0) return;
  const now = useShop.getState().bag;
  // Nothing changed while the account answered: take what it holds.
  if (now === before) {
    useShop.setState({ bag: r.lines });
    return;
  }
  // The shopper added or removed something meanwhile. Keep their bag as it is
  // now and add the account's pieces it doesn't have yet.
  const have = new Set(now.map((l) => l.id));
  const extra = r.lines.filter((l) => !have.has(l.id));
  if (extra.length) useShop.setState({ bag: [...now, ...extra] });
}

/**
 * For a signed-in shopper, brings the bag they left on another device into
 * this one when a page loads. A signed-out shopper is left alone, and so is a
 * bag when the account holds nothing.
 */
export function BagClaim() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void claimIntoBag();
  }, []);
  return null;
}
