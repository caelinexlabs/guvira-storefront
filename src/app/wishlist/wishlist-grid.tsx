"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { PillLink } from "@/components/ui";
import type { Product } from "@/lib/commerce/types";
import { useShop } from "@/lib/store/shop";

const subscribe = () => () => {};

export function WishlistGrid({ products }: { products: Product[] }) {
  const ids = useShop((s) => s.wishlist);
  // The wishlist lives in this browser, so render nothing until we're on the client.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  const saved = products.filter((p) => ids.includes(p.id));

  if (!saved.length)
    return (
      <div className="empty-state">
        <span className="ic">
          <Icon name="heart" />
        </span>
        <p>Nothing saved yet. Tap the heart on any piece to keep it here.</p>
        <PillLink href="/shop">Browse jewellery</PillLink>
      </div>
    );

  return (
    <ul className="shop-grid">
      {saved.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} sizes="(max-width: 860px) 50vw, 25vw" />
        </li>
      ))}
    </ul>
  );
}
