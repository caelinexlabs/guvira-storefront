const LINES = [
  { kind: "script", text: "anti tarnish boutique" },
  { kind: "plain", text: "Curation for the elegant women" },
] as const;

/** The brand line under the footer watermark. */
export function FootTagline() {
  return (
    <div className="tagline">
      <p className="tagline-run">
        {LINES.map((l) => (
          <span key={l.text} className={`tagline-${l.kind}`}>
            {l.text}
          </span>
        ))}
      </p>
    </div>
  );
}
