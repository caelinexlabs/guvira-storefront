import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { OrderView } from "@/components/order-view";
import { getOrder } from "@/lib/caelinex/orders";
import { getShopSettings } from "@/lib/caelinex/settings";
import { getAccount } from "../../session";
import { ReturnPanel } from "./return-panel";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function AccountOrderPage({ params }: Props) {
  await getAccount();
  const { token } = await params;
  const [r, settings] = await Promise.all([getOrder(token), getShopSettings()]);
  if (!r.ok) notFound();
  const wa = settings.features.whatsapp;
  const digits = wa.number.replace(/[^\d]/g, "");
  const askHref =
    wa.enabled && digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hello, a question about my order ${r.value.orderNumber}.`)}`
      : undefined;
  return (
    <>
      <Link className="ord-back" href="/account/orders">
        <Icon name="chev" />
        All orders
      </Link>
      <OrderView
        order={r.value}
        token={token}
        backTo={`/account/orders/${token}`}
        askHref={askHref}
        actions={
          r.value.status !== "CANCELLED" ? (
            <ReturnPanel orderToken={token} currency={r.value.currency} />
          ) : undefined
        }
      />
    </>
  );
}
