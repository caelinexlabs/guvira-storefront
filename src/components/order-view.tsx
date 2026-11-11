import Image from "next/image";
import type { Order } from "@/lib/caelinex/orders";
import { formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATE: Record<string, string> = {
  CANCELLED: "Cancelled",
  FULFILLED: "Shipped",
  PARTIAL: "Partly shipped",
  UNFULFILLED: "Being prepared",
};

/** An order as Caelinex reports it: status, parcels, items, totals and history. */
export function OrderView({ order: o }: { order: Order }) {
  const money = (n: number) => formatMoney(n, o.currency as Currency);
  const status =
    o.status === "CANCELLED" ? STATE.CANCELLED : STATE[o.fulfilmentStatus];
  return (
    <div className="track-found">
      <p className="result-lead">
        Order <b>{o.orderNumber}</b> · placed {day(o.placedAt)} ·{" "}
        <b>{status}</b>
      </p>

      {o.shipments.map((s) => (
        <section
          className="result-card"
          key={`${s.trackingNumber}-${s.shippedAt}`}
        >
          <h2>
            {s.carrier ? `Shipped with ${s.carrier}` : "Shipped"}
            {s.shippedAt ? ` · ${day(s.shippedAt)}` : ""}
          </h2>
          <p>{s.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</p>
          {s.trackingUrl ? (
            <a href={s.trackingUrl} rel="noopener noreferrer" target="_blank">
              Track parcel{s.trackingNumber ? ` ${s.trackingNumber}` : ""}
            </a>
          ) : (
            s.trackingNumber && <p>Tracking number {s.trackingNumber}</p>
          )}
        </section>
      ))}

      <div className="result-grid">
        <section className="result-card" aria-labelledby="t-items">
          <h2 id="t-items">What you ordered</h2>
          <ul className="result-items">
            {o.lines.map((l) => (
              <li key={`${l.name}-${l.variantName ?? ""}`}>
                {l.imageUrl && (
                  <Image src={l.imageUrl} alt="" width={56} height={70} />
                )}
                <span>
                  {l.name}
                  <small>
                    {[l.variantName, `Qty ${l.quantity}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <b>{money(l.lineTotal)}</b>
              </li>
            ))}
          </ul>
          {o.discountTotal > 0 && (
            <p className="result-total">
              <span>Discount</span>
              <b>−{money(o.discountTotal)}</b>
            </p>
          )}
          <p className="result-total">
            <span>{o.shippingName ?? "Delivery"}</span>
            <b>{o.shippingTotal ? money(o.shippingTotal) : "Free"}</b>
          </p>
          <p className="result-total">
            <span>Total</span>
            <b>{money(o.total)}</b>
          </p>
        </section>
        <section className="result-card" aria-labelledby="t-hist">
          <h2 id="t-hist">What’s happened</h2>
          <ol className="track-events">
            {o.timeline.map((e) => (
              <li key={`${e.kind}-${e.at}`}>
                <b>{e.message}</b>
                <small>{day(e.at)}</small>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
