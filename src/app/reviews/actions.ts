"use server";

import { revalidatePath } from "next/cache";
import { writeReview } from "@/lib/caelinex/reviews";
import { reviewInput } from "@/lib/validation/forms";
import { check } from "@/lib/validation/schemas";

export type ReviewState = { done?: boolean; error?: string };

/** Sends one review for a piece on an order. Caelinex decides who may; its words come back as the error. */
export async function sendReview(
  orderToken: string,
  listingId: string,
  _prev: ReviewState,
  form: FormData,
): Promise<ReviewState> {
  const input = check(reviewInput, {
    orderToken,
    listingId,
    rating: form.get("rating"),
    title: form.get("title"),
    body: form.get("body"),
  });
  if (!input.ok) return { error: input.message };
  const { orderToken: token, ...review } = input.value;
  const r = await writeReview(token, review);
  if (!r.ok)
    return {
      error:
        r.message ?? "We couldn’t send your review. Try again in a minute.",
    };
  revalidatePath(`/orders/${token}`);
  revalidatePath(`/account/orders/${token}`);
  return { done: true };
}
