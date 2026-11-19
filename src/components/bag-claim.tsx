"use client";

import { useEffect, useRef } from "react";
import { claimBag } from "@/app/cart/actions";
import { useShop } from "@/lib/store/shop";

/** Joins this browser's bag to the one saved on the shopper's account. */
export async function claimIntoBag() {
  const r = await claimBag();
  if (r.status === "ok" && r.lines.length > 0)
    useShop.setState({ bag: r.lines });
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
