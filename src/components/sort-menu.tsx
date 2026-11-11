"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "./icons";

/** A native <details> menu that also closes on an outside click, Escape or a choice. */
export function SortMenu({
  label,
  options,
}: {
  label: string;
  options: { href: string; label: string; current: boolean }[];
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => ref.current?.removeAttribute("open");
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        close();
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details className="sort-menu" ref={ref}>
      <summary>
        Sort: {label}
        <Icon name="chev" />
      </summary>
      <nav aria-label="Sort">
        {options.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            aria-current={o.current ? "true" : undefined}
            onClick={() => ref.current?.removeAttribute("open")}
          >
            {o.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
