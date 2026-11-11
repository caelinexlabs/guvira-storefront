"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Heading, PillLink } from "@/components/ui";
import { loadOrder, type PlacedOrder } from "@/lib/checkout/session-store";
import { formatMoney } from "@/lib/commerce/money";
import { priceFor } from "@/lib/commerce/price";

const STAGES = ["Order placed", "Being prepared", "Shipped", "Delivered"];

/**
 * The confirmation. It reads the order this tab just placed; once Caelinex
 * has an orders API it will load the order by number instead.
 */
export function OrderPlaced() {
  const [order, setOrder] = useState<PlacedOrder | null>();
  useEffect(() => setOrder(loadOrder() ?? null), []);

  if (order === undefined) return <div className="result-wait" />;
  if (order === null)
    return (
      <div className="result">
        <span className="result-mark">
          <Icon name="bag" />
        </span>
        <Heading as="h1" script="no recent" caps="Order here" />
        <p className="result-lead">
          We couldn’t find a recent order in this window. If you placed one,
          your confirmation email has the details.
        </p>
        <div className="result-actions">
          <PillLink href="/help/orders" tone="dark">
            Track an order
          </PillLink>
          <PillLink href="/shop">Continue shopping</PillLink>
        </div>
      </div>
    );

  const placed = new Date(order.placedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const first = order.name.split(" ")[0];

  return (
    <div className="result">
      <span className="result-mark ok">
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="m15 27 7.5 7.5L37 19" />
        </svg>
      </span>
      <Heading
        as="h1"
        script={first ? `thank you, ${first.toLowerCase()}` : "thank you"}
        caps="Order placed"
      />
      <p className="result-lead">
        Order <b>{order.number}</b> · {placed}.{" "}
        {order.cod
          ? "Pay in cash when it’s delivered."
          : "Your payment went through."}{" "}
        Your confirmation goes to <b>{order.email}</b>.
      </p>

      <ol className="result-track" aria-label="Order progress">
        {STAGES.map((s, i) => (
          <li key={s} className={i === 0 ? "on" : undefined}>
            <span aria-hidden="true">{i === 0 && <Icon name="check" />}</span>
            {s}
            {i === 0 && <span className="vh"> (done)</span>}
          </li>
        ))}
      </ol>

      <div className="result-grid">
        <section className="result-card" aria-labelledby="items-h">
          <h2 id="items-h">What you ordered</h2>
          <ul className="result-items">
            {order.lines.map((l) => (
              <li key={`${l.id}-${l.size ?? ""}`}>
                <Image
                  src={l.image.src}
                  alt=""
                  width={56}
                  height={70}
                  style={{ objectPosition: l.image.position }}
                />
                <span>
                  {l.name}
                  <small>
                    {[l.size && `Size ${l.size}`, `Qty ${l.qty}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <b>
                  {formatMoney(
                    priceFor(l.prices, order.currency).amount * l.qty,
                    order.currency,
                  )}
                </b>
              </li>
            ))}
          </ul>
          <p className="result-total">
            <span>Total</span>
            <b>{formatMoney(order.total, order.currency)}</b>
          </p>
        </section>
        <section className="result-card" aria-labelledby="ship-h">
          <h2 id="ship-h">Delivering to</h2>
          <address>
            {order.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span>{order.phone}</span>
          </address>
          <h2>Payment</h2>
          <p>{order.payment}</p>
        </section>
      </div>

      <div className="result-actions">
        <PillLink href="/shop" tone="dark">
          Continue shopping
        </PillLink>
        <PillLink href="/help/orders">How tracking works</PillLink>
      </div>
    </div>
  );
}
