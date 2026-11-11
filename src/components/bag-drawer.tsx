"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import Link from "next/link";
import { totalPrices } from "@/lib/commerce/price";
import { useShop } from "@/lib/store/shop";
import { Icon } from "./icons";
import { Price } from "./price";
import { PillLink } from "./ui";

export function BagDrawer() {
  const { bag, bagOpen, openBag, setQty, remove } = useShop();
  const totals = totalPrices(bag);

  return (
    <Dialog.Root open={bagOpen} onOpenChange={openBag}>
      <Dialog.Portal>
        <Dialog.Backdrop className="sheet-scrim" />
        <Dialog.Popup className="sheet sheet-bottom">
          <div className="sheet-head">
            <Dialog.Title className="sheet-title">your bag</Dialog.Title>
            <Dialog.Close className="icon-btn" aria-label="Close bag">
              <Icon name="close" />
            </Dialog.Close>
          </div>
          {bag.length === 0 ? (
            <div className="bag-empty">
              <p>Your bag is empty. The rings are a good place to start.</p>
              <PillLink
                tone="dark"
                href="/shop/rings"
                onClick={() => openBag(false)}
              >
                Shop rings
              </PillLink>
            </div>
          ) : (
            <ul className="bag-list">
              {bag.map((l, i) => (
                <li className="bag-item" key={`${l.id}-${l.size ?? ""}`}>
                  <Image
                    src={l.image.src}
                    alt=""
                    width={72}
                    height={90}
                    style={{ objectPosition: l.image.position }}
                  />
                  <div>
                    <Link
                      className="bag-item-name"
                      href={`/products/${l.slug}`}
                      onClick={() => openBag(false)}
                    >
                      {l.name}
                    </Link>
                    <p className="bag-item-meta">
                      {l.line}
                      {l.size ? ` · Size ${l.size}` : ""}
                    </p>
                    <fieldset className="stepper">
                      <legend className="vh">{`Quantity of ${l.name}`}</legend>
                      <button
                        type="button"
                        aria-label="One fewer"
                        onClick={() => setQty(i, l.qty - 1)}
                      >
                        <Icon name="minus" />
                      </button>
                      <output aria-live="polite">{l.qty}</output>
                      <button
                        type="button"
                        aria-label="One more"
                        onClick={() => setQty(i, l.qty + 1)}
                      >
                        <Icon name="plus" />
                      </button>
                    </fieldset>
                  </div>
                  <div className="bag-item-side">
                    <Price
                      prices={l.prices}
                      qty={l.qty}
                      className="bag-item-price"
                    />
                    <button
                      type="button"
                      className="bag-remove"
                      onClick={() => remove(i)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {bag.length > 0 && (
            <div className="drawer-foot">
              <div className="drawer-total">
                <span>Subtotal</span>
                <Price prices={totals} />
              </div>
              <PillLink
                tone="dark"
                href="/checkout"
                aria-disabled={bag.length === 0}
                onClick={(e) =>
                  bag.length === 0 ? e.preventDefault() : openBag(false)
                }
              >
                Checkout
              </PillLink>
              <small>Taxes and shipping are worked out at checkout.</small>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
