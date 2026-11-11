import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderView } from "@/components/order-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { getOrder } from "@/lib/caelinex/orders";
import { getSessionToken } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function AccountOrderPage({ params }: Props) {
  if (!(await getSessionToken())) redirect("/account/sign-in");
  const r = await getOrder((await params).token);
  if (!r.ok) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/account">Your account</Link>
        </nav>
        <Heading as="h1" script="your" caps="Order" />
        <OrderView order={r.value} />
      </main>
      <SiteFooter slim />
    </>
  );
}
