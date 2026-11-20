import type { ProductReviews } from "@/lib/caelinex/reviews";
import { orderDate } from "@/lib/order-status";
import { Stars } from "./stars";

/**
 * What shoppers who bought the piece say. Says nothing when the shop has
 * reviews off or none are published yet.
 */
export function ReviewsView({ data }: { data: ProductReviews | null }) {
  if (!data?.enabled || data.total === 0) return null;
  const { summary, reviews, total } = data;

  return (
    <section className="reviews" aria-labelledby="reviews-h">
      <div className="wrap reviews-in">
        <header className="reviews-sum">
          <h2 id="reviews-h">Reviews</h2>
          <p className="reviews-avg">
            <b>{summary.average.toFixed(1)}</b>
            <Stars value={summary.average} size={18} />
            <span>
              {total} {total === 1 ? "review" : "reviews"}
            </span>
          </p>
          <ul className="reviews-bars" aria-label="Reviews by rating">
            {([5, 4, 3, 2, 1] as const).map((n) => (
              <li key={n}>
                <span>{n}</span>
                <i aria-hidden="true">
                  <b
                    style={{
                      width: `${(summary.distribution[n] / summary.count) * 100}%`,
                    }}
                  />
                </i>
                <small>{summary.distribution[n]}</small>
              </li>
            ))}
          </ul>
        </header>
        <ul className="reviews-list">
          {reviews.map((v) => (
            <li key={v.id}>
              <Stars value={v.rating} />
              {v.title && <h3>{v.title}</h3>}
              {v.body && <p>{v.body}</p>}
              <small>
                {v.authorName} · Verified purchase · {orderDate(v.createdAt)}
              </small>
              {v.reply && (
                <blockquote>
                  <b>Guvira replied</b>
                  <p>{v.reply}</p>
                </blockquote>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
