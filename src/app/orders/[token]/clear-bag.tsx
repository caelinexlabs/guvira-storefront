"use client";

import { useEffect } from "react";
import { saveDraft, savePending } from "@/lib/checkout/session-store";
import { useShop } from "@/lib/store/shop";

/** A paid order: the bag and the half-done checkout are finished with. */
export function ClearBag() {
  const clearBag = useShop((s) => s.clearBag);
  useEffect(() => {
    clearBag();
    saveDraft(undefined);
    savePending(undefined);
  }, [clearBag]);
  return null;
}
