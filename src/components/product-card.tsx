"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/commerce/types";
import { useShop } from "@/lib/store/shop";
import { Icon } from "./icons";
import { Price } from "./price";
import { useShopConfig } from "./shop-config";

/**
 * Card used in rails and grids. Hover shows a second photo; the round button
 * adds to the bag (pieces with sizes go to the product page to pick one).
 * `clone` marks the duplicate set in the looping rail: hidden from assistive tech.
 */
export function ProductCard({
  product,
  clone = false,
  sizes = "(max-width: 860px) 60vw, 25vw",
}: {
  product: Product;
  clone?: boolean;
  sizes?: string;
}) {
  const add = useShop((s) => s.add);
  const toggleWish = useShop((s) => s.toggleWish);
  const wished = useShop((s) => s.wishlist.includes(product.id));
  const openBag = useShop((s) => s.openBag);
  const { wishlist } = useShopConfig();
  const [added, setAdded] = useState(false);
  const [a, b] = product.images;
  const href = `/products/${product.slug}`;

  const quickAdd = () => {
    if (product.sizes?.length) {
      window.location.assign(`${href}#size`);
      return;
    }
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      line: product.line,
      image: a,
      prices: product.prices,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast("Added to your bag", {
      action: { label: "View bag", onClick: () => openBag(true) },
    });
  };

  return (
    <article
      className="card"
      data-k={product.category}
      aria-hidden={clone || undefined}
      inert={clone || undefined}
    >
      <div
        className="media"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        }}
      >
        <Link href={href} aria-label={product.name}>
          <Image
            src={a.src}
            alt={a.alt}
            fill
            sizes={sizes}
            style={{ objectPosition: a.position }}
          />
          {b && (
            <Image
              src={b.src}
              alt=""
              fill
              sizes={sizes}
              style={{ objectPosition: b.position }}
            />
          )}
        </Link>
        {product.flag && <span className="flag">{product.flag}</span>}
        {wishlist && (
          <button
            className="wish"
            type="button"
            aria-pressed={wished}
            aria-label={`Save ${product.name}`}
            onClick={() =>
              toast(
                toggleWish(product.id)
                  ? "Saved to your wishlist"
                  : "Removed from your wishlist",
              )
            }
          >
            <Icon name="heart" />
          </button>
        )}
        {product.priced && (
          <button
            className="quick"
            type="button"
            data-state={added ? "added" : undefined}
            aria-label={
              product.sizes?.length
                ? `Choose a size for ${product.name}`
                : `Add ${product.name} to bag`
            }
            onClick={quickAdd}
          >
            <Icon name={added ? "check" : "plus"} />
            <span>
              {added
                ? "Added"
                : product.sizes?.length
                  ? "Choose size"
                  : "Add to bag"}
            </span>
          </button>
        )}
      </div>
      <div className="info">
        <div>
          <Link href={href}>{product.name}</Link>
          <small>{product.line}</small>
        </div>
        <Price prices={product.prices} className="price" />
      </div>
    </article>
  );
}
