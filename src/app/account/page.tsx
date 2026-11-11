import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { getCustomer, listShopperOrders } from "@/lib/caelinex/shopper";
import { formatMoney } from "@/lib/commerce/money";
import type { Currency } from "@/lib/commerce/types";
import { getSessionToken } from "@/lib/session";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

export default async function AccountPage() {
  const token = await getSessionToken();
  if (!token) redirect("/account/sign-in");
  const customer = await getCustomer(token);
  if (!customer.ok && customer.reason === "unauthorised")
    redirect("/account/sign-in");
  const name = customer.ok ? customer.value.name.split(" ")[0] : "";
  const orders = await listShopperOrders(token);
  const status = (o: { status: string; fulfilmentStatus: string }) =>
    o.status === "CANCELLED"
      ? "Cancelled"
      : o.fulfilmentStatus === "FULFILLED"
        ? "Shipped"
        : o.fulfilmentStatus === "PARTIAL"
          ? "Partly shipped"
          : "Being prepared";

  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap account">
        <Heading
          as="h1"
          script={name ? `hello ${name.toLowerCase()}` : "hello"}
          caps="Your account"
        />
        {customer.ok ? (
          <p className="auth-intro">
            Signed in as {customer.value.email ?? customer.value.phone ?? "you"}
            .
          </p>
        ) : (
          <output className="notice">
            We couldn’t load your details just now. Refresh to try again.
          </output>
        )}
        <div className="account-grid">
          <section className="account-card" aria-labelledby="orders-h">
            <h2 id="orders-h">Orders</h2>
            {!orders.ok ? (
              <p>
                We couldn’t load your orders just now. Refresh to try again.
              </p>
            ) : orders.value.orders.length === 0 ? (
              <p>
                No orders yet. Orders placed with your email or mobile show
                here.
              </p>
            ) : (
              <ul className="order-list">
                {orders.value.orders.map((o) => (
                  <li key={o.token}>
                    <Link href={`/account/orders/${o.token}`}>
                      <b>Order {o.orderNumber}</b>
                      <span>
                        {new Date(o.placedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {status(o)}
                      </span>
                      <small>
                        {o.items
                          .map((i) => `${i.name} × ${i.quantity}`)
                          .join(", ")}
                      </small>
                    </Link>
                    <b>{formatMoney(o.total, o.currency as Currency)}</b>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="account-card" aria-labelledby="wish-h">
            <h2 id="wish-h">Wishlist</h2>
            <p>Pieces you’ve saved on this device.</p>
            <Link href="/wishlist" className="text-link">
              See your wishlist <Icon name="chev" />
            </Link>
          </section>
          <section className="account-card" aria-labelledby="addr-h">
            <h2 id="addr-h">Addresses</h2>
            <p>Saved delivery addresses aren’t available yet.</p>
          </section>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-btn">
            Sign out
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
