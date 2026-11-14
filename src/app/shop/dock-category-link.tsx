"use client";

import Link from "next/link";
import { type ComponentProps, useEffect } from "react";

const KEY = "guvira:dock-open";

/**
 * A category tile. A category is its own page (`/shop/ring`), so the dock is
 * built again after the click and the sheet would close. The tile notes that
 * the sheet was open, with the time, and `DockReopen` opens it again on the new page.
 */
export function DockCategoryLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      scroll={false}
      onClick={(e) => {
        props.onClick?.(e);
        try {
          sessionStorage.setItem(KEY, String(Date.now()));
        } catch {
          // Storage is blocked: the sheet stays closed, which is harmless.
        }
      }}
    />
  );
}

/** Opens the sheet when the page was reached from one of its category tiles. */
export function DockReopen({ sheetId }: { sheetId: string }) {
  useEffect(() => {
    try {
      const at = Number(sessionStorage.getItem(KEY));
      sessionStorage.removeItem(KEY);
      // A click that stayed on the same page leaves a stale note: ignore it.
      if (!at || Date.now() - at > 5000) return;
    } catch {
      return;
    }
    const sheet = document.getElementById(sheetId);
    if (sheet?.matches(":not(:popover-open)")) sheet.showPopover?.();
  }, [sheetId]);
  return null;
}
