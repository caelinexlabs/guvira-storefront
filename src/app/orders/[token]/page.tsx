import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/order-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading, PillLink } from "@/components/ui";
import { getOrder } from "@/lib/caelinex/orders";
import { ClearBag } from "./clear-bag";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

type Props = { params: Promise<{ token: string }> };

/** The thank-you page for an online order. It shows what Caelinex says, never the address bar. */
export default async function OrderPage({ params }: Props) {
  const r = await getOrder((await params).token);
  if (!r.ok) notFound();
  const o = r.value;
  const paid = o.paymentStatus === "PAID";
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap">
        {paid && <ClearBag />}
        <Heading
          as="h1"
          script={paid ? "thank you" : "almost"}
          caps={paid ? "Order placed" : "Payment pending"}
        />
        <p className="result-lead">
          {paid
            ? "Your payment went through. Your confirmation goes to the email you gave."
            : "We haven’t received your payment yet. If you’ve paid, this page updates shortly."}
        </p>
        <OrderView order={o} />
        <div className="result-actions">
          <PillLink href="/shop" tone="dark">
            Continue shopping
          </PillLink>
        </div>
      </main>
      <SiteFooter slim />
    </>
  );
}
