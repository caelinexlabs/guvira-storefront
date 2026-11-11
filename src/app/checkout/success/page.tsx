import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OrderPlaced } from "./order-placed";

export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false },
};

export default function OrderSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap result-page">
        <OrderPlaced />
      </main>
      <SiteFooter slim />
    </>
  );
}
