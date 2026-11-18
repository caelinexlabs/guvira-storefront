"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { syncBag } from "@/app/cart/actions";
import { loadPending } from "@/lib/checkout/session-store";
import { useShop } from "@/lib/store/shop";

/**
 * Mirrors the bag into the Caelinex cart after each change. When Caelinex
 * holds fewer than asked (stock, or no price yet) the bag is brought back in
 * line and the shopper is told why, in Caelinex's own words.
 */
export function BagSync() {
  const bag = useShop((s) => s.bag);
  const key = bag.map((l) => `${l.id}:${l.qty}`).join(",");

  // A bag saved before the shop was connected holds pieces Caelinex has never
  // heard of; drop them.
  useEffect(() => {
    const { bag: now, setQty } = useShop.getState();
    now.forEach((l, i) => {
      if (!/^[0-9a-f]{32}$/.test(l.id)) setQty(i, 0);
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for the bag's contents
  useEffect(() => {
    const lines = bag.map((l) => ({ id: l.id, qty: l.qty }));
    const t = setTimeout(async () => {
      const r = await syncBag(lines);
      if (r.status !== "ok") return;
      const { bag: now, setQty } = useShop.getState();
      // An order for this very bag is waiting for payment, so its stock is
      // held by that order. Don't empty the bag the shopper is paying for.
      if (loadPending()?.bag === now.map((l) => `${l.id}:${l.qty}`).join(","))
        return;
      for (const p of r.problems) {
        const i = now.findIndex((l) => l.id === p.id);
        if (i === -1) continue;
        const held = r.held.find((h) => h.id === p.id)?.qty ?? 0;
        toast(p.message);
        setQty(i, held);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [key]);

  return null;
}
