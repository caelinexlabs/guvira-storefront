"use client";

import { useEffect, useRef } from "react";
import { mergeDeviceWishlist, setWishlisted } from "@/app/wishlist/actions";
import { useShop } from "@/lib/store/shop";

/**
 * For a signed-in shopper, keeps the wishlist on the account, so it follows
 * them to any device. On load it joins this device's list to the account's;
 * after that each heart pressed is passed on. A signed-out shopper keeps the
 * device list only.
 */
export function WishlistSync() {
  // What the account is known to hold. Null until the first merge succeeds,
  // and for a signed-out shopper, which keeps changes from being sent.
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    let alive = true;
    const unsubscribe = useShop.subscribe((s, prev) => {
      const sent = known.current;
      if (!sent || s.wishlist === prev.wishlist) return;
      const now = new Set(s.wishlist);
      for (const id of now)
        if (!sent.has(id)) {
          sent.add(id);
          void setWishlisted(id, true);
        }
      for (const id of [...sent])
        if (!now.has(id)) {
          sent.delete(id);
          void setWishlisted(id, false);
        }
    });

    (async () => {
      const r = await mergeDeviceWishlist(useShop.getState().wishlist);
      if (!alive || r.status !== "ok") return;
      // Pieces hearted while the merge ran are on the device but not yet on
      // the account; send them on the next change instead of losing them.
      known.current = new Set(r.ids);
      const device = useShop.getState().wishlist;
      useShop.setState({ wishlist: [...new Set([...device, ...r.ids])] });
    })();

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return null;
}
