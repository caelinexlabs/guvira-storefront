import { getOrderReviews } from "@/lib/caelinex/reviews";
import { ReviewForm } from "./review-form";
import { Stars } from "./stars";

const STATUS = {
  PENDING: "Waiting for the shop to read it",
  PUBLISHED: "Live on the product page",
} as const;

/**
 * Reviews for one order: a button for each piece that has shipped and has no
 * review yet, and what has been written. Says nothing when the shop has
 * reviews off or there is nothing to review.
 */
export async function OrderReviews({ orderToken }: { orderToken: string }) {
  const r = await getOrderReviews(orderToken);
  if (!r.ok || !r.value.enabled) return null;
  const { reviewable, reviews } = r.value;
  const written = reviews.filter((v) => v.status !== "HIDDEN");
  if (reviewable.length === 0 && written.length === 0) return null;

  return (
    <section className="ord-reviews" aria-labelledby={`rev-${orderToken}`}>
      <h3 id={`rev-${orderToken}`}>Reviews</h3>
      {written.length > 0 && (
        <ul className="ord-review-list">
          {written.map((v) => (
            <li key={v.id}>
              <b>{v.product.name}</b>
              <Stars value={v.rating} />
              {v.title && <span>{v.title}</span>}
              <small>{STATUS[v.status as keyof typeof STATUS]}</small>
            </li>
          ))}
        </ul>
      )}
      {reviewable.map((p) => (
        <ReviewForm
          key={p.listingId}
          orderToken={orderToken}
          listingId={p.listingId}
          name={p.name}
        />
      ))}
    </section>
  );
}
