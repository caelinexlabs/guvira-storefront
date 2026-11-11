/** A labelled control with its hint and error, tied together for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={["field", error && "has-error", className]
        .filter(Boolean)
        .join(" ")}
    >
      <label htmlFor={`co-${id}`}>{label}</label>
      {children}
      {hint && !error && <small id={`co-${id}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`co-${id}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}

/** aria props for a control inside <Field>. */
export function describe(id: string, error?: string, hint = false) {
  const ids = [hint && !error && `co-${id}-hint`, error && `co-${id}-error`]
    .filter(Boolean)
    .join(" ");
  return {
    id: `co-${id}`,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids || undefined,
  } as const;
}
