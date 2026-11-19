import "server-only";
import { type StorefrontResult, storefront } from "./storefront";

export type OrderEvent = {
  kind:
    | "PLACED"
    | "PAID"
    | "PACKED"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  message: string;
  at: string;
};

/** The furthest step every parcel of an order has reached. */
export type FulfilmentStage =
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export type Shipment = {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  /** When the carrier expects to deliver; sent once Caelinex has it. */
  expectedDeliveryAt?: string | null;
  deliveredAt?: string | null;
  /** Where this parcel is; sent once Caelinex tracks each step. */
  status?: FulfilmentStage;
  packedAt?: string | null;
  outForDeliveryAt?: string | null;
  /** What the carrier reported, oldest first. */
  events?: {
    status: string;
    message: string | null;
    location: string | null;
    occurredAt: string;
  }[];
  items: {
    name: string;
    variantName: string | null;
    quantity: number;
    slug?: string | null;
  }[];
};

export type OrderLine = {
  productId?: string;
  /** What a return refers to. */
  id?: string;
  /** The piece's page, once Caelinex sends it. */
  slug?: string | null;
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
  /** Sent once Caelinex tracks delivery; until then an order ends at "shipped". */
  deliveredAt?: string | null;
  /** Null until something is packed. Sent once Caelinex tracks each step. */
  fulfilmentStage?: FulfilmentStage | null;
  packedAt?: string | null;
  shippedAt?: string | null;
  outForDeliveryAt?: string | null;
  cancelledAt?: string | null;
  /** "Cancelled by the shop", "Payment was not completed" or "Refunded in full"; null on older orders. */
  cancelReason?: string | null;
  refundStatus?: "NONE" | "PENDING" | "PARTIAL" | "REFUNDED";
  refundedAmount?: number | null;
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

/** Cancel an online order that is still unpaid, freeing its stock. Safe to repeat. */
export const cancelOrder = (token: string): Promise<StorefrontResult<Order>> =>
  storefront<Order>(`/orders/${encodeURIComponent(token)}/cancel`, {
    method: "POST",
  });
