export type OrderStage = "prep" | "partial" | "shipped" | "cancelled";

/** What Caelinex tells us about an order, in the shopper's words. */
export function orderStage(o: { status: string; fulfilmentStatus: string }): {
  stage: OrderStage;
  label: string;
} {
  if (o.status === "CANCELLED")
    return { stage: "cancelled", label: "Cancelled" };
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
