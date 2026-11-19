import "server-only";
import { type StorefrontResult, storefront } from "./storefront";

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: string;
  /** The shop's answer, when it wrote one. */
  reply: string | null;
  repliedAt: string | null;
};

export type RatingSummary = {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviews = {
  /** False when the shop has reviews switched off. */
  enabled: boolean;
  summary: RatingSummary;
  total: number;
  page: number;
  pageSize: number;
  reviews: Review[];
};

export type OrderReviews = {
  enabled: boolean;
  /** Pieces on the order that have shipped and have no review yet. */
  reviewable: { listingId: string; name: string; slug: string | null }[];
  /** What this order's shopper has written, with where each one stands. */
  reviews: (Review & {
    status: "PENDING" | "PUBLISHED" | "HIDDEN";
    product: { id: string; name: string; slug: string | null };
  })[];
};

export const getProductReviews = (
  slug: string,
  page = 1,
): Promise<StorefrontResult<ProductReviews>> =>
  storefront<ProductReviews>(
    `/products/${encodeURIComponent(slug)}/reviews?page=${page}&pageSize=10`,
  );

export const getOrderReviews = (
  orderToken: string,
): Promise<StorefrontResult<OrderReviews>> =>
  storefront<OrderReviews>(`/orders/${encodeURIComponent(orderToken)}/reviews`);

export const writeReview = (
  orderToken: string,
  body: { listingId: string; rating: number; title?: string; body?: string },
): Promise<StorefrontResult<OrderReviews>> =>
  storefront<OrderReviews>(
    `/orders/${encodeURIComponent(orderToken)}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
