import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PillLink } from "@/components/ui";
import { formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { orderDate, orderStage } from "./order-status";
import { OrderThumb } from "./order-thumb";
import { getAccount, getOrders } from "./session";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

const STEPS = ["Placed", "Being prepared", "Shipped"] as const;

export default async function AccountOverview() {
  const { token, customer } = await getAccount();
  const orders = await getOrders(token);
  const all = orders.ok ? orders.value.orders : [];
  // The dark panel follows the newest order still on its way. A cancelled one
  // gets a quiet note beside it instead of the spotlight.
  const latest = all.find((o) => orderStage(o).stage !== "cancelled");
  const cancelled =
    all[0] && orderStage(all[0]).stage === "cancelled" ? all[0] : undefined;
  const who = customer.ok ? customer.value : undefined;
  const initial = (who?.name || who?.email || "G").charAt(0).toUpperCase();
  const stage = latest ? orderStage(latest) : undefined;
  // Placed is always done; the rest follow the order's progress.
  const at = stage?.stage === "shipped" ? 2 : 1;

  return (
    <div className="acct-stack">
      {customer.ok ? (
        <section className="acct-card acct-prof" aria-label="Your details">
          <span className="acct-mono" aria-hidden="true">
            {initial}
          </span>
          <div>
            <h2>{who?.name || "Your details"}</h2>
            <p>{[who?.email, who?.phone].filter(Boolean).join(" · ")}</p>
          </div>
          <Link className="text-btn" href="/account/details">
            Edit
          </Link>
        </section>
      ) : (
        <p className="notice" role="alert">
          We couldn’t load your details just now. Refresh to try again.
        </p>
      )}

      {cancelled && (
        <p className="acct-card acct-quiet">
          <span>
            Order {cancelled.orderNumber} was cancelled. Placed{" "}
            {orderDate(cancelled.placedAt)}.
          </span>
          <Link
            className="text-btn"
            href={`/account/orders/${cancelled.token}`}
          >
            View order
          </Link>
        </p>
      )}

      {!orders.ok ? (
        <p className="acct-card" role="alert">
          We couldn’t load your orders just now. Refresh to try again.
        </p>
      ) : latest && stage ? (
        <section className="acct-dark" aria-labelledby="latest-h">
          <div className="acct-dark-top">
            <div>
              <p className="acct-eyebrow">Latest order</p>
              <h2 id="latest-h">Order {latest.orderNumber}</h2>
              <p className="acct-meta">
                Placed {orderDate(latest.placedAt)} · {latest.itemCount}{" "}
                {latest.itemCount === 1 ? "piece" : "pieces"} ·{" "}
                {formatMoney(latest.total, latest.currency as Currency)}
              </p>
            </div>
            <span className={`acct-chip is-${stage.stage}`}>
              <i aria-hidden="true" />
              {stage.label}
            </span>
          </div>
          <ul className="acct-items">
            {latest.items.slice(0, 4).map((i) => (
              <li key={`${i.name}-${i.variantName}`} title={i.name}>
                <OrderThumb name={i.name} imageUrl={i.imageUrl} width={52} />
                <span className="vh">
                  {i.name} × {i.quantity}
                </span>
              </li>
            ))}
          </ul>
          <ol className="acct-track" aria-label="Order progress">
            {STEPS.map((s, n) => (
              <li
                key={s}
                className={n < at ? "done" : n === at ? "now" : undefined}
                aria-current={n === at ? "step" : undefined}
              >
                {s}
              </li>
            ))}
          </ol>
          <PillLink
            href={`/account/orders/${latest.token}`}
            className="acct-view"
          >
            View order
          </PillLink>
        </section>
      ) : (
        <section className="acct-card">
          <h2>{cancelled ? "Nothing on its way" : "No orders yet"}</h2>
          <p>
            {cancelled
              ? "Find your next piece in the shop."
              : "Orders placed with your email or mobile show here."}
          </p>
          <PillLink href="/shop">Browse jewellery</PillLink>
        </section>
      )}

      <div className="acct-help">
        <Link href="/help/shipping">Shipping and returns</Link>
        <Link href="/orders/track">Track an order</Link>
        <Link href="/help/contact">
          <Icon name="mail" />
          Contact us
        </Link>
      </div>
    </div>
  );
}
