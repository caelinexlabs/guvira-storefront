"use client";

import { useActionState, useId, useState } from "react";
import { type ReviewState, sendReview } from "@/app/reviews/actions";
import { PillButton } from "./ui";

/** One piece, one review: stars, a line and a few words. Closed until asked for. */
export function ReviewForm({
  orderToken,
  listingId,
  name,
}: {
  orderToken: string;
  listingId: string;
  name: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, act, pending] = useActionState<ReviewState, FormData>(
    (prev, form) => sendReview(orderToken, listingId, prev, form),
    {},
  );

  if (!open)
    return (
      <button
        type="button"
        className="acct-ghost"
        aria-expanded="false"
        onClick={() => setOpen(true)}
      >
        Review {name}
      </button>
    );

  return (
    <form action={act} className="acct-edit review-form" noValidate>
      <fieldset className="review-rate">
        <legend>Your rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={rating >= n ? "on" : undefined}>
            <input
              type="radio"
              name="rating"
              value={n}
              checked={rating === n}
              onChange={() => setRating(n)}
            />
            <span className="vh">{n} out of 5</span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
            </svg>
          </label>
        ))}
      </fieldset>
      <label htmlFor={`${id}-t`}>Headline</label>
      <input id={`${id}-t`} name="title" maxLength={120} autoComplete="off" />
      <label htmlFor={`${id}-b`}>Your review</label>
      <textarea id={`${id}-b`} name="body" rows={4} maxLength={2000} />
      {state.error && (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      )}
      <div className="review-actions">
        <PillButton type="submit" tone="dark" pending={pending}>
          Send review
        </PillButton>
        <button
          type="button"
          className="text-btn"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
