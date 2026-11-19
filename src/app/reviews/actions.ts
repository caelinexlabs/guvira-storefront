"use server";

import { revalidatePath } from "next/cache";
import { writeReview } from "@/lib/caelinex/reviews";

export type ReviewState = { done?: boolean; error?: string };

/** Sends one review for a piece on an order. Caelinex decides who may; its words come back as the error. */
export async function sendReview(
  orderToken: string,
  listingId: string,
  _prev: ReviewState,
  form: FormData,
): Promise<ReviewState> {
  const rating = Number.parseInt(String(form.get("rating") ?? ""), 10);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { error: "Choose a rating from one to five stars." };
  const title = String(form.get("title") ?? "")
    .trim()
    .slice(0, 120);
  const body = String(form.get("body") ?? "")
    .trim()
    .slice(0, 2000);
  const r = await writeReview(orderToken, {
    listingId,
    rating,
    title: title || undefined,
    body: body || undefined,
  });
  if (!r.ok)
    return {
      error:
        r.message ?? "We couldn’t send your review. Try again in a minute.",
    };
  revalidatePath(`/orders/${orderToken}`);
  revalidatePath(`/account/orders/${orderToken}`);
  return { done: true };
}
