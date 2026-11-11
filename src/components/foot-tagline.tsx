"use client";

import { useState } from "react";
import { Icon } from "./icons";

const LINES = [
  { kind: "script", text: "anti tarnish boutique" },
  { kind: "plain", text: "Curation for the elegant women" },
] as const;

/**
 * The brand line under the hologram, running slowly from right to left. It
 * pauses on hover and focus, the button stops it for good, and people who
 * ask for less motion get one still line.
 */
export function FootTagline() {
  const [paused, setPaused] = useState(false);
  // One run of the line; drawn twice so the loop has no seam.
  const run = (hidden: boolean) => (
    <span className="tagline-run" aria-hidden={hidden || undefined}>
      {LINES.map((l) => (
        <span key={l.text} className={`tagline-${l.kind}`}>
          {l.text}
          <Icon name="spark" />
        </span>
      ))}
    </span>
  );

  return (
    <div className="tagline" data-paused={paused || undefined}>
      <p className="tagline-track">
        {run(false)}
        {run(true)}
      </p>
      <button
        type="button"
        className="icon-btn tagline-toggle"
        aria-label={paused ? "Play the tagline" : "Pause the tagline"}
        onClick={() => setPaused((p) => !p)}
      >
        <Icon name={paused ? "play" : "pause"} />
      </button>
    </div>
  );
}
