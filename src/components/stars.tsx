const STAR =
  "M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z";

/** A rating as five stars; the text carries it for screen readers. */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={value >= n - 0.25 ? "on" : undefined}
        >
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}
