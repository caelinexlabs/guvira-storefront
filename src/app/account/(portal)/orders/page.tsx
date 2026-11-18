import type { Metadata } from "next";
import Link from "next/link";
import { PillLink } from "@/components/ui";
import type { ShopperOrder } from "@/lib/caelinex/shopper";
import { formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { orderDate, orderStage } from "@/lib/order-status";
import { OrderThumb } from "../order-thumb";
import { getAccount, getOrders } from "../session";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "In progress" },
  { key: "shipped", label: "Shipped" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type Key = (typeof FILTERS)[number]["key"];

const inFilter = (o: ShopperOrder, key: Key) => {
  const { stage } = orderStage(o);
  if (key === "all") return true;
  if (key === "open") return stage === "prep" || stage === "partial";
  return stage === key;
};

export default async function AccountOrders({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { token } = await getAccount();
  const { show } = await searchParams;
  const orders = await getOrders(token);
  const key: Key = FILTERS.some((f) => f.key === show) ? (show as Key) : "all";

  return (
    <section aria-labelledby="orders-h">
      <h2 className="acct-h" id="orders-h">
        Orders
      </h2>
      <p className="acct-sub">
        Orders placed with your email or mobile show here.
      </p>
      {!orders.ok ? (
        <p className="acct-card">
          We couldn’t load your orders just now. Refresh to try again.
        </p>
      ) : orders.value.orders.length === 0 ? (
        <div className="acct-card">
          <p>No orders yet.</p>
          <PillLink href="/shop">Browse jewellery</PillLink>
        </div>
      ) : (
        <>
          {orders.value.orders.length >= 3 && (
            <nav className="acct-seg" aria-label="Filter orders">
              {FILTERS.map((f) => {
                const n = orders.value.orders.filter((o) =>
                  inFilter(o, f.key),
                ).length;
                if (f.key !== "all" && n === 0) return null;
                return (
                  <Link
                    key={f.key}
                    href={
                      f.key === "all" ? "/account/orders" : `?show=${f.key}`
                    }
                    scroll={false}
                    aria-current={f.key === key ? "true" : undefined}
                  >
                    {f.label}
                    <small>{n}</small>
                  </Link>
                );
              })}
            </nav>
          )}
          <ul className="acct-orders">
            {orders.value.orders
              .filter((o) => inFilter(o, key))
              .map((o) => {
                const { stage, label } = orderStage(o);
                return (
                  <li
                    key={o.token}
                    className={`acct-card acct-ord${stage === "cancelled" ? " is-void" : ""}`}
                  >
                    <div className="acct-ord-h">
                      <h3>
                        Order {o.orderNumber}
                        <span>{orderDate(o.placedAt)}</span>
                      </h3>
                      <span className={`acct-chip is-${stage}`}>
                        <i aria-hidden="true" />
                        {label}
                      </span>
                    </div>
                    <div className="acct-ord-b">
                      <ul className="acct-thumbs">
                        {o.items.slice(0, 3).map((i) => (
                          <li
                            key={`${i.name}-${i.variantName}`}
                            aria-hidden="true"
                          >
                            <OrderThumb
                              name={i.name}
                              imageUrl={i.imageUrl}
                              width={56}
                            />
                          </li>
                        ))}
                      </ul>
                      <p>
                        {o.items
                          .map((i) => `${i.name} × ${i.quantity}`)
                          .join(", ")}
                      </p>
                      <b>{formatMoney(o.total, o.currency as Currency)}</b>
                    </div>
                    <div className="acct-ord-f">
                      <PillLink
                        href={`/account/orders/${o.token}`}
                        className="sm"
                      >
                        {stage === "shipped" ? "Track order" : "View order"}
                      </PillLink>
                      {stage === "shipped" && (
                        <Link
                          className="acct-ghost"
                          href={`/account/orders/${o.token}`}
                        >
                          View order
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </>
      )}
    </section>
  );
}
