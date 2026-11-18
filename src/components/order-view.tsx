import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useId } from "react";
import type { Order } from "@/lib/caelinex/orders";
import { countryByCode } from "@/lib/checkout/countries";
import { CURRENCY_META, formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { awaitingPayment, orderDate, orderStage } from "@/lib/order-status";
import { PayNowButton, ReorderButton } from "./order-actions";
import { CopyButton, OrderTools } from "./order-tools";
import { PillLink } from "./ui";

/** Whole amounts as the shop shows them; an amount with paise keeps them. */
const exact = (n: number, currency: Currency) =>
  Number.isInteger(n)
    ? formatMoney(n, currency)
    : new Intl.NumberFormat(CURRENCY_META[currency].locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(n);

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** The delivery address as lines to read, from whatever Caelinex kept. */
function addressLines(a: Order["shippingAddress"]): string[] {
  if (!a) return [];
  const country = str(a.country);
  return [
    str(a.name),
    [str(a.line1), str(a.line2)].filter(Boolean).join(", "),
    [str(a.city), str(a.region), str(a.postalCode)].filter(Boolean).join(", "),
    country ? (countryByCode(country)?.name ?? country) : "",
    str(a.phone),
  ].filter(Boolean);
}

/** "Standard" alone reads as a mystery in a totals list. */
const deliveryLabel = (name: string | null) =>
  !name
    ? "Delivery"
    : /deliver|shipping|courier|pickup/i.test(name)
      ? name
      : `${name} delivery`;

/** One line of help that fits where the order stands. */
function helpLine(o: Order, stage: string) {
  if (o.deliveredAt || stage === "cancelled") return "";
  if (stage === "shipped" || stage === "partial")
    return "Parcel not moving? Ask us and we’ll check with the carrier.";
  if (o.paymentStatus === "PENDING" && o.paymentMethod !== "COD")
    return "Paid but still showing pending? It can take a few minutes. Tell us if it doesn’t clear.";
  return "";
}

/** How the order is being paid for, in plain words. */
function paymentLine(o: Order) {
  const cod = o.paymentMethod === "COD";
  if (o.paymentStatus === "PAID") return cod ? "Paid" : "Paid online";
  return cod ? "Pay on delivery" : "Payment pending";
}

/**
 * An order as Caelinex reports it: where it is, what is in it, what it cost,
 * where it is going and what has happened. Shared by the account, the
 * thank-you page and "track an order", so each reads the same.
 */
export function OrderView({
  order: o,
  actions,
  askHref,
  token,
  backTo,
}: {
  order: Order;
  /** Extra sections for the account page, such as returns. */
  actions?: ReactNode;
  /** A chat link that already quotes this order, when the shop has one. */
  askHref?: string;
  /** The order's own key; with it an unpaid online order can be paid from here. */
  token?: string;
  /** Where Razorpay's cancel link returns to when paying from here. */
  backTo?: string;
}) {
  const uid = useId();
  const money = (n: number) => exact(n, o.currency as Currency);
  const { stage, label } = orderStage(o);
  const cancelled = stage === "cancelled";
  const unpaid = awaitingPayment(o);
  const address = addressLines(o.shippingAddress);
  const pieces = o.lines.reduce((n, l) => n + l.quantity, 0);
  const tracked = o.shipments.filter((s) => s.trackingUrl);
  // The order's history, newest first. A cancellation the history never
  // recorded (older orders) is added from the date Caelinex kept.
  const timeline =
    cancelled &&
    o.cancelledAt &&
    !o.timeline.some((e) => e.kind === "CANCELLED")
      ? [
          ...o.timeline,
          {
            kind: "CANCELLED" as const,
            message: "Order cancelled.",
            at: o.cancelledAt,
          },
        ]
      : o.timeline;
  const events = [...timeline].reverse();
  const refunded =
    o.refundStatus === "REFUNDED" ||
    o.refundStatus === "PARTIAL" ||
    o.refundStatus === "PENDING" ||
    o.timeline.some((e) => e.kind === "REFUNDED");
  // The refund, in words, from what Caelinex reports.
  const refundLine =
    o.refundStatus === "PENDING"
      ? "A refund is on its way."
      : o.refundStatus === "REFUNDED"
        ? o.refundedAmount
          ? `Refunded ${money(o.refundedAmount)}.`
          : "Refunded."
        : o.refundStatus === "PARTIAL"
          ? o.refundedAmount
            ? `Part of it has been refunded: ${money(o.refundedAmount)}.`
            : "Part of it has been refunded."
          : null;
  // Where a shipped order stands: partly or fully on its way.
  // "Delivered" only appears once Caelinex tracks delivery.
  const tracksDelivery = "deliveredAt" in o;
  const delivered = Boolean(o.deliveredAt);
  const steps: string[] = [
    "Placed",
    "Being prepared",
    stage === "partial" ? "Partly shipped" : "Shipped",
    ...(tracksDelivery ? ["Delivered"] : []),
  ];
  // The step the order is on; steps.length means every step is done.
  const cur = delivered
    ? steps.length
    : stage === "shipped"
      ? tracksDelivery
        ? 3
        : steps.length
      : stage === "partial"
        ? 2
        : 1;
  const expected = o.shipments
    .map((sh) => sh.expectedDeliveryAt)
    .filter((d): d is string => Boolean(d))
    .sort()[0];
  // How many of each piece have left in a parcel, to tell pieces apart on a partial order.
  const sent = new Map<string, number>();
  for (const sh of o.shipments)
    for (const it of sh.items)
      sent.set(
        `${it.name}|${it.variantName ?? ""}`,
        (sent.get(`${it.name}|${it.variantName ?? ""}`) ?? 0) + it.quantity,
      );
  const showPieceStatus = stage === "partial";
  // What "Order again" puts back in the bag: every piece that still has a page.
  const again = o.lines
    .filter((l) => l.slug)
    .map((l) => ({
      slug: l.slug as string,
      qty: l.quantity,
      size: l.variantName,
    }));
  const canPay =
    unpaid && token && o.payment?.razorpayOrderId
      ? { token, payment: o.payment }
      : null;

  return (
    <article className="ord" aria-labelledby={`${uid}-h`}>
      <header className="ord-head">
        <div>
          <h2 id={`${uid}-h`}>Order {o.orderNumber}</h2>
          <p>
            Placed {orderDate(o.placedAt)} · {pieces}{" "}
            {pieces === 1 ? "piece" : "pieces"} · {money(o.total)}
            {!cancelled && ` · ${paymentLine(o)}`}
          </p>
          <OrderTools
            orderNumber={o.orderNumber}
            trackingUrl={tracked[0]?.trackingUrl ?? undefined}
            trackingNumber={tracked[0]?.trackingNumber}
          />
        </div>
        <span className={`acct-chip is-${delivered ? "delivered" : stage}`}>
          <i aria-hidden="true" />
          {label}
        </span>
      </header>

      {cancelled ? (
        <div className="ord-void">
          <p>
            This order was cancelled
            {o.cancelledAt ? ` on ${orderDate(o.cancelledAt)}` : ""}.
            {o.cancelReason ? ` ${o.cancelReason}.` : ""}
          </p>
          {o.paymentStatus !== "PAID" ? (
            <p>You weren’t charged.</p>
          ) : refundLine ? (
            <p>{refundLine}</p>
          ) : (
            !refunded && (
              <p>
                This order was paid for. For a refund, please{" "}
                <Link href="/help/contact">contact us</Link>.
              </p>
            )
          )}
          <div className="ord-go">
            {again.length > 0 ? (
              <ReorderButton pieces={again} />
            ) : (
              <PillLink href="/shop" className="sm">
                Shop again
              </PillLink>
            )}
          </div>
        </div>
      ) : unpaid ? (
        <div className="ord-void">
          <p>We haven’t received your payment yet.</p>
          <p>
            {canPay
              ? "Pay now to confirm this order. An order that stays unpaid is cancelled after a day."
              : "If you’ve paid, this updates shortly. An order that stays unpaid is cancelled after a day."}
          </p>
          {canPay && (
            <div className="ord-go">
              <PayNowButton
                token={canPay.token}
                number={o.orderNumber}
                payment={canPay.payment}
                prefill={{ name: o.customerName ?? "", email: "", contact: "" }}
                backTo={backTo ?? `/orders/${canPay.token}`}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="ord-status">
          <ol
            className={`ord-track${delivered ? " is-delivered" : ""}`}
            aria-label="Order progress"
            style={{ "--n": steps.length } as CSSProperties}
          >
            {steps.map((st, n) => {
              const state = n < cur ? "done" : n === cur ? "now" : "next";
              return (
                <li
                  key={st}
                  className={state === "next" ? undefined : state}
                  aria-current={state === "now" ? "step" : undefined}
                >
                  <span className="vh">
                    {state === "done"
                      ? "Done: "
                      : state === "now"
                        ? "Now: "
                        : "Next: "}
                  </span>
                  {st}
                </li>
              );
            })}
          </ol>
          {(delivered || expected) && (
            <p className="ord-eta">
              {delivered
                ? `Delivered ${orderDate(o.deliveredAt as string)}.`
                : `Expected by ${orderDate(expected as string)}.`}
            </p>
          )}
          {delivered && (
            <p className="ord-care">
              To keep the finish, wipe it dry after water and store it apart
              from other pieces.
            </p>
          )}
          {(!delivered && tracked.length > 0) ||
          (delivered && again.length > 0) ? (
            <div className="ord-go">
              {delivered ? (
                <ReorderButton pieces={again} />
              ) : (
                tracked.map((s, i) => (
                  <PillLink
                    key={`${s.trackingNumber}-${s.shippedAt}`}
                    href={s.trackingUrl ?? "#"}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="sm"
                  >
                    {tracked.length > 1
                      ? `Track parcel ${i + 1}`
                      : "Track parcel"}
                  </PillLink>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="ord-cols">
        <section className="ord-card" aria-labelledby={`${uid}-items`}>
          <h3 id={`${uid}-items`}>What you ordered</h3>
          <ul className="ord-lines">
            {o.lines.map((l, i) => (
              <li key={`${i}-${l.name}-${l.variantName ?? ""}`}>
                <span className="ord-thumb" aria-hidden="true">
                  {l.imageUrl ? (
                    <Image src={l.imageUrl} alt="" width={72} height={90} />
                  ) : (
                    l.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="ord-name">
                  <b>
                    {l.slug ? (
                      <Link href={`/products/${l.slug}`}>{l.name}</Link>
                    ) : (
                      l.name
                    )}
                  </b>
                  <small>
                    {[
                      l.variantName,
                      l.quantity > 1
                        ? `${l.quantity} × ${money(l.unitPrice)}`
                        : "Qty 1",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                  {showPieceStatus && (
                    <em className="ord-tag">
                      {(sent.get(`${l.name}|${l.variantName ?? ""}`) ?? 0) >=
                      l.quantity
                        ? "Shipped"
                        : "Still being prepared"}
                    </em>
                  )}
                </span>
                <b className="ord-price">{money(l.lineTotal)}</b>
              </li>
            ))}
          </ul>
          <dl className="ord-sums">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(o.subtotal)}</dd>
            </div>
            {o.discounts.length > 0
              ? o.discounts.map((d, i) => (
                  <div key={`${i}-${d.name}-${d.code ?? ""}`}>
                    <dt>{d.code ? `Discount (${d.code})` : d.name}</dt>
                    <dd>−{money(d.amount)}</dd>
                  </div>
                ))
              : o.discountTotal > 0 && (
                  <div>
                    <dt>Discount</dt>
                    <dd>−{money(o.discountTotal)}</dd>
                  </div>
                )}
            {typeof o.shippingTotal === "number" && (
              <div>
                <dt>{deliveryLabel(o.shippingName)}</dt>
                <dd>
                  {o.shippingTotal === 0 ? "Free" : money(o.shippingTotal)}
                </dd>
              </div>
            )}
            {o.taxTotal > 0 && (
              <div>
                <dt>Tax</dt>
                <dd>{money(o.taxTotal)}</dd>
              </div>
            )}
            <div className="total">
              <dt>Total</dt>
              <dd>{money(o.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="ord-side">
          {!cancelled && address.length > 0 && (
            <section aria-labelledby={`${uid}-addr`}>
              <h3 id={`${uid}-addr`}>Delivering to</h3>
              <address>
                {address.map((line, i) => (
                  <span key={`${i}-${line}`}>{line}</span>
                ))}
              </address>
            </section>
          )}

          {o.shipments.map((s, i) => (
            <section
              key={`${i}-${s.trackingNumber}-${s.shippedAt}`}
              aria-labelledby={`${uid}-p${i}`}
            >
              <h3 id={`${uid}-p${i}`}>
                {s.carrier ? `Shipped with ${s.carrier}` : "Shipped"}
                {s.shippedAt ? ` · ${orderDate(s.shippedAt)}` : ""}
              </h3>
              <p>
                {s.items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}
              </p>
              {s.trackingNumber && (
                <p>
                  Tracking number <b>{s.trackingNumber}</b>{" "}
                  <CopyButton text={s.trackingNumber} label="Copy number" />
                </p>
              )}
            </section>
          ))}

          <details className="ord-hist">
            <summary>
              Order history <span>{events.length}</span>
            </summary>
            <ol className="ord-events">
              {events.map((e, i) => (
                <li key={`${i}-${e.kind}-${e.at}`}>
                  <b>{e.message}</b>
                  <small>{orderDate(e.at)}</small>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>

      {actions}

      <section className="ord-help" aria-labelledby={`${uid}-help`}>
        <h3 id={`${uid}-help`}>Need a hand with this order?</h3>
        <p>
          {helpLine(o, stage)}{" "}
          <Link href="/help/shipping">Shipping and returns</Link>
          {" · "}
          <Link href="/help/contact">Contact us</Link>
          {askHref && (
            <>
              {" · "}
              <a href={askHref} target="_blank" rel="noopener noreferrer">
                Ask on WhatsApp
              </a>
            </>
          )}
        </p>
      </section>
    </article>
  );
}
