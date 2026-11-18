export type OrderStage = "prep" | "partial" | "shipped" | "cancelled";

/** An online order that was placed but not paid for yet. */
export const awaitingPayment = (o: {
  status: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
}) =>
  o.status === "OPEN" &&
  o.paymentStatus === "PENDING" &&
  Boolean(o.paymentMethod) &&
  o.paymentMethod !== "COD";

/** What Caelinex tells us about an order, in the shopper's words. */
export function orderStage(o: {
  status: string;
  fulfilmentStatus: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  deliveredAt?: string | null;
}): {
  stage: OrderStage;
  label: string;
} {
  if (o.status === "CANCELLED")
    return { stage: "cancelled", label: "Cancelled" };
  if (o.deliveredAt) return { stage: "shipped", label: "Delivered" };
  if (awaitingPayment(o)) return { stage: "prep", label: "Awaiting payment" };
  if (o.fulfilmentStatus === "FULFILLED")
    return { stage: "shipped", label: "Shipped" };
  if (o.fulfilmentStatus === "PARTIAL")
    return { stage: "partial", label: "Partly shipped" };
  return { stage: "prep", label: "Being prepared" };
}

export const orderDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
