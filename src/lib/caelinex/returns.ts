import "server-only";
import { type StorefrontResult, storefront } from "./storefront";

export const RETURN_REASONS = {
  DAMAGED: "It arrived damaged",
  WRONG_ITEM: "I received the wrong piece",
  NOT_AS_DESCRIBED: "It isn’t as described",
  SIZE_FIT: "Size or fit",
  CHANGED_MIND: "I changed my mind",
  OTHER: "Something else",
} as const;

export type ReturnReason = keyof typeof RETURN_REASONS;

export type ReturnRequest = {
  returnNumber: string | number;
  status:
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "RECEIVED"
    | "REFUNDED"
    | "CANCELLED";
  reason?: string | null;
  decisionNote?: string | null;
  refundAmount?: number | null;
  lines?: { name?: string; quantity: number }[];
};

export type Returns = {
  policy: {
    enabled: boolean;
    windowDays: number;
    canRequest: boolean;
    endsAt: string | null;
  };
  returnable: {
    orderLineId: string;
    name: string;
    variantName: string | null;
    quantity: number;
  }[];
  returns: ReturnRequest[];
};

/** What a shopper can send back from an order, and what they have already asked for. */
export const getReturns = (
  orderToken: string,
): Promise<StorefrontResult<Returns>> =>
  storefront<Returns>(`/orders/${encodeURIComponent(orderToken)}/returns`);

export const requestReturn = (
  orderToken: string,
  body: {
    reasonCode: ReturnReason;
    note?: string;
    lines: { orderLineId: string; quantity: number }[];
  },
): Promise<StorefrontResult<Returns>> =>
  storefront<Returns>(`/orders/${encodeURIComponent(orderToken)}/returns`, {
    method: "POST",
    body: JSON.stringify(body),
  });
