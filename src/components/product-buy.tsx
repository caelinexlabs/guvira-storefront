"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { checkDelivery, type DeliveryCheck } from "@/app/delivery/actions";
import { COUNTRIES } from "@/lib/checkout/countries";
import type { Product } from "@/lib/commerce/types";
import { promiseIcon } from "@/lib/promise-icons";
import { useShop } from "@/lib/store/shop";
import { Icon } from "./icons";
import { Price } from "./price";
import { useShopConfig } from "./shop-config";
import { PillButton } from "./ui";

/**
 * Thumbnails down the left, the chosen photo on the right. The photo zooms
 * where the pointer is on a mouse; on touch it swipes to the next photo.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const count = product.images.length;
  const thumbs = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const show = (i: number) => {
    const next = (i + count) % count;
    setActive(next);
    thumbs.current?.children[next]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  };

  return (
    <div className="gallery">
      <div className="thumbs" ref={thumbs}>
        {product.images.map((im, i) => (
          <button
            key={im.src}
            type="button"
            className={clsx("thumb", i === active && "on")}
            aria-label={`Show photo ${i + 1} of ${count}`}
            aria-current={i === active || undefined}
            onClick={() => show(i)}
          >
            <Image
              src={im.src}
              alt=""
              width={88}
              height={110}
              sizes="88px"
              loading="eager"
              style={{ objectPosition: im.position }}
            />
          </button>
        ))}
      </div>
      <figure
        className="ph stage"
        onPointerEnter={(e) =>
          matchMedia("(hover: hover) and (pointer: fine)").matches &&
          e.currentTarget.classList.add("zoom")
        }
        onPointerLeave={(e) => e.currentTarget.classList.remove("zoom")}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--zx",
            `${((e.clientX - r.left) / r.width) * 100}%`,
          );
          e.currentTarget.style.setProperty(
            "--zy",
            `${((e.clientY - r.top) / r.height) * 100}%`,
          );
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse")
            swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y))
            show(active + (dx < 0 ? 1 : -1));
        }}
      >
        {product.flag && (
          <div className="tags">
            <span>{product.flag}</span>
          </div>
        )}
        {product.images.map((im, i) => (
          <Image
            key={im.src}
            src={im.src}
            alt={im.alt}
            fill
            priority={i === 0}
            className={clsx(i === active && "on")}
            aria-hidden={i !== active}
            sizes="(max-width: 860px) 80vw, 46vw"
            style={{ objectPosition: im.position }}
          />
        ))}
        <figcaption className="count" aria-live="polite">
          {active + 1} / {count}
        </figcaption>
      </figure>
    </div>
  );
}

/** Size, add to bag, wishlist and the delivery check, plus the sticky bar on phones. */
export function BuyBox({ product }: { product: Product }) {
  const add = useShop((s) => s.add);
  const openBag = useShop((s) => s.openBag);
  const toggleWish = useShop((s) => s.toggleWish);
  const wished = useShop((s) => s.wishlist.includes(product.id));
  const [size, setSize] = useState(
    product.sizes?.[Math.min(1, product.sizes.length - 1)],
  );
  const [added, setAdded] = useState(false);
  const currency = useShop((s) => s.currency);
  const { wishlist, deliveryCheck, stickyAddToCart, sizeGuide, promises } =
    useShopConfig();
  const [country, setCountry] = useState<string>();
  const [deliver, setDeliver] = useState<string>();
  const [checking, startCheck] = useTransition();
  const shipTo =
    country ?? COUNTRIES.find((c) => c.currency === currency)?.code ?? "IN";
  const [sticky, setSticky] = useState(false);
  const mainAdd = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = mainAdd.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setSticky(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToBag = () => {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      line: product.line,
      image: product.images[0],
      prices: product.prices,
      size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast("Added to your bag", {
      action: { label: "View bag", onClick: () => openBag(true) },
    });
  };

  return (
    <>
      <div className="price-row">
        <Price prices={product.prices} className="price" />
      </div>
      {product.sizes && (
        <fieldset className="opt" id="size">
          <legend className="opt-head">
            Ring size{" "}
            {sizeGuide.enabled && <a href="#size-guide">Size guide</a>}
          </legend>
          <div className="sizes">
            {product.sizes.map((s) => (
              <label key={s}>
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  onChange={() => setSize(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="cta">
        <PillButton
          tone="dark"
          icon={added ? "check" : "arrow"}
          ref={mainAdd}
          type="button"
          data-state={added ? "added" : undefined}
          disabled={!product.priced}
          onClick={addToBag}
        >
          {added && product.priced ? "Added to bag" : "Add to bag"}
        </PillButton>
        {wishlist && (
          <button
            type="button"
            className="icon-btn"
            aria-pressed={wished}
            aria-label="Save to wishlist"
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
      </div>
      {deliveryCheck && (
        <>
          <form
            className="deliver"
            onSubmit={(e) => {
              e.preventDefault();
              const v = new FormData(e.currentTarget)
                .get("pin")
                ?.toString()
                .trim();
              if (!v) return setDeliver("Enter a PIN code or postcode first.");
              setDeliver(undefined);
              startCheck(async () =>
                setDeliver(deliveryMessage(await checkDelivery(shipTo, v))),
              );
            }}
          >
            <Icon name="box" />
            <label htmlFor="pin">Deliver to</label>
            <select
              aria-label="Country"
              value={shipTo}
              onChange={(e) => {
                setCountry(e.target.value);
                setDeliver(undefined);
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              id="pin"
              name="pin"
              placeholder="PIN or postcode"
              spellCheck={false}
              autoComplete="postal-code"
              aria-describedby="deliver-msg"
            />
            <button type="submit" disabled={checking}>
              {checking ? "Checking" : "Check"}
            </button>
          </form>
          <p className="deliver-msg" id="deliver-msg" aria-live="polite">
            {deliver}
          </p>
        </>
      )}

      {promises.length > 0 && (
        <ul className="promises">
          {promises.map((p) => {
            const icon = promiseIcon(p.icon);
            return (
              <li key={p.title}>
                {icon && <Icon name={icon} />}
                <div>
                  <b>{p.title}</b>
                  {p.text && <span>{p.text}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {stickyAddToCart && (
        <div
          className={`sticky-buy${sticky ? " on" : ""}`}
          aria-hidden={!sticky}
        >
          <Image src={product.images[0].src} alt="" width={44} height={44} />
          <div>
            <b>{product.name}</b>
            <span>
              <Price prices={product.prices} />
            </span>
          </div>
          <PillButton
            tone="dark"
            type="button"
            tabIndex={sticky ? 0 : -1}
            disabled={!product.priced}
            onClick={addToBag}
          >
            Add to bag
          </PillButton>
        </div>
      )}
    </>
  );
}

function deliveryMessage(r: DeliveryCheck): string {
  switch (r.status) {
    case "ok": {
      const { minDays: a, maxDays: b } = r;
      const when =
        a != null && b != null
          ? a === b
            ? ` in about ${a} ${a === 1 ? "day" : "days"}`
            : ` in ${a} to ${b} days`
          : "";
      return `We deliver to this address${when}.`;
    }
    case "no-service":
      return "We don’t deliver to this address yet.";
    case "free-form":
      return "Your delivery date is shown at checkout.";
    case "bad-code":
      return r.message;
    default:
      return "We couldn’t check just now. Your delivery date is shown at checkout.";
  }
}
