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
    // Changes go out one at a time, each against the latest list, so a quick
    // add then remove can't arrive reversed. A piece counts as on the account
    // only once the account has said so; a failed call is tried again on the
    // next change.
    let queue: Promise<void> = Promise.resolve();
    const flush = async () => {
      const onAccount = known.current;
      if (!alive || !onAccount) return;
      const now = new Set(useShop.getState().wishlist);
      for (const id of now)
        if (
          !onAccount.has(id) &&
          (await setWishlisted(id, true)).status === "ok"
        )
          onAccount.add(id);
      for (const id of [...onAccount])
        if (!now.has(id) && (await setWishlisted(id, false)).status === "ok")
          onAccount.delete(id);
    };
    const unsubscribe = useShop.subscribe((s, prev) => {
      if (!known.current || s.wishlist === prev.wishlist) return;
      queue = queue.then(flush);
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
