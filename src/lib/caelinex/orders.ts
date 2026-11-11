import "server-only";
import { type StorefrontResult, storefront } from "./storefront";

export type OrderEvent = {
  kind: "PLACED" | "PAID" | "SHIPPED" | "CANCELLED" | "REFUNDED";
  message: string;
  at: string;
};

export type Shipment = {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  items: { name: string; variantName: string | null; quantity: number }[];
};

export type OrderLine = {
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  orderNumber: number;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID";
  fulfilmentStatus: "UNFULFILLED" | "PARTIAL" | "FULFILLED";
  paymentMethod: string | null;
  placedAt: string;
  currency: string;
  customerName: string | null;
  shippingAddress: Record<string, unknown> | null;
  lines: OrderLine[];
  shipments: Shipment[];
  timeline: OrderEvent[];
  subtotal: number;
  discountTotal: number;
  discounts: { name: string; code: string | null; amount: number }[];
  shippingTotal: number;
  shippingName: string | null;
  taxTotal: number;
  total: number;
  /** For an online order still waiting to be paid; null once paid, or for cash on delivery. */
  payment?: {
    provider: string;
    keyId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  } | null;
};

/**
 * Find an order without a link: its number plus the email or mobile it was
 * placed with. Every miss gets the same answer, so we never say which part
 * was wrong.
 */
export const lookupOrder = (
  orderNumber: number,
  contact: { email: string } | { phone: string },
): Promise<StorefrontResult<Order>> =>
  storefront<Order>("/orders/lookup", {
    method: "POST",
    body: JSON.stringify({ orderNumber, ...contact }),
  });

/** An order by its own token: the thank-you page and "my orders". */
export const getOrder = (token: string): Promise<StorefrontResult<Order>> =>
  storefront<Order>(`/orders/${encodeURIComponent(token)}`);

/** Tell Caelinex the shopper paid; it verifies Razorpay's signature itself. */
export const confirmRazorpayPayment = (
  orderToken: string,
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
): Promise<StorefrontResult<Order>> =>
  storefront<Order>(`/orders/${encodeURIComponent(orderToken)}/payment`, {
    method: "POST",
    body: JSON.stringify(payment),
  });
