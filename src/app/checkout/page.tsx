import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { getOrder } from "@/lib/caelinex/orders";
import { getCustomer } from "@/lib/caelinex/shopper";
import { getSessionToken } from "@/lib/session";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TOKEN = /^[\w-]{10,100}$/;

const one = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : undefined;

export default async function CheckoutPage({ searchParams }: Props) {
  const q = await searchParams;
  const returned = one(q.cancelled)
    ? ({ kind: "cancelled" } as const)
    : one(q.payment) === "failed"
      ? ({ kind: "failed", reason: one(q.reason)?.slice(0, 200) } as const)
      : undefined;
  // Coming back from Razorpay: if that order is still waiting for payment, the
  // shopper can pay it again even when the bag has since been emptied.
  const orderToken = one(q.cancelled) ?? one(q.order);
  const found =
    returned && orderToken && TOKEN.test(orderToken)
      ? await getOrder(orderToken)
      : undefined;
  const o = found?.ok ? found.value : undefined;
  const waiting =
    o?.payment && o.paymentStatus === "PENDING" && o.status === "OPEN"
      ? {
          token: orderToken as string,
          number: String(o.orderNumber),
          name: o.customerName ?? "",
          currency: o.currency,
          total: o.total,
          lines: o.lines,
          payment: o.payment,
        }
      : undefined;
  // A signed-in shopper skips step 1 and gets their details filled in.
  const token = await getSessionToken();
  const me = token ? await getCustomer(token) : undefined;
  const customer = me?.ok ? me.value : undefined;
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/shop">Continue shopping</Link>
        </nav>
        <Heading as="h1" script="almost" caps="Checkout" />
        <CheckoutForm
          customer={customer}
          returned={returned}
          waiting={waiting}
        />
      </main>
      <SiteFooter slim />
    </>
  );
}
