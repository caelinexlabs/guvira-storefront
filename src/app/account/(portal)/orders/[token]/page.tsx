import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { OrderView } from "@/components/order-view";
import { getOrder } from "@/lib/caelinex/orders";
import { getAccount } from "../../session";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function AccountOrderPage({ params }: Props) {
  await getAccount();
  const r = await getOrder((await params).token);
  if (!r.ok) notFound();
  return (
    <>
      <Link className="ord-back" href="/account/orders">
        <Icon name="chev" />
        All orders
      </Link>
      <OrderView order={r.value} />
    </>
  );
}
