import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderReviews } from "@/components/order-reviews";
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

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string }>;
};

/** The thank-you page for an online order. It shows what Caelinex says, never the address bar. */
export default async function OrderPage({ params, searchParams }: Props) {
  const { token } = await params;
  const failed = (await searchParams).payment === "failed";
  const r = await getOrder(token);
  if (!r.ok) notFound();
  const o = r.value;
  const cod = o.paymentMethod === "COD";
  const paid = o.paymentStatus === "PAID";
  // A cash-on-delivery order is placed and confirmed before anything is paid.
  const placed = paid || cod;
  const cancelled = o.status === "CANCELLED";
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap ord-page">
        {placed && !cancelled && <ClearBag />}
        <div className="ord-confirm">
          <Heading
            as="h1"
            script={cancelled ? "this order" : placed ? "thank you" : "almost"}
            caps={
              cancelled
                ? "Cancelled"
                : placed
                  ? "Order placed"
                  : "Payment pending"
            }
          />
          <p className="result-lead">
            {cancelled
              ? "This order was cancelled. The details are below."
              : placed
                ? paid
                  ? "Your payment went through. Your confirmation goes to the email you gave."
                  : "Your order is placed and you pay when it arrives. Your confirmation goes to the email you gave."
                : failed
                  ? "Your payment didn’t go through. Nothing was charged. You can try again below."
                  : "We haven’t received your payment yet. If you’ve paid, this page updates shortly."}
          </p>
        </div>
        <div className="ord-body">
          <OrderView order={o} token={token} />
          {!cancelled && <OrderReviews orderToken={token} />}
        </div>
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
