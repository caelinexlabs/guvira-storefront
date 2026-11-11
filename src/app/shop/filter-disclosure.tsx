"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

/**
 * On a phone the filters fold behind one button, so the first screen shows
 * products and not a wall of chips. From tablet width up they are always open.
 */
export function FilterDisclosure({
  active,
  children,
}: {
  /** How many filters are on, shown on the button. */
  active: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="filters" data-open={open || undefined}>
      <button
        type="button"
        className="filters-toggle"
        aria-expanded={open}
        aria-controls="filters-body"
        onClick={() => setOpen((o) => !o)}
      >
        Filters
        {active > 0 && <span className="filters-count">{active}</span>}
        <Icon name="chev" />
      </button>
      <div id="filters-body" className="filters-body">
        {children}
      </div>
    </div>
  );
}
