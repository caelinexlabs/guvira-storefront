"use client";

import { useEffect, useRef } from "react";

/**
 * The large GUVIRA watermark at the foot of the page. Its foil sheen drifts on
 * its own and, on a mouse, follows the pointer across the footer like a
 * hologram catching the light. Decorative only.
 */
export function HoloMark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const area = el?.closest("footer");
    if (!el || !area) return;
    if (
      !matchMedia("(hover: hover) and (pointer: fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const move = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      el.style.setProperty(
        "--hx",
        `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`,
      );
      el.classList.add("live");
    };
    const leave = () => el.classList.remove("live");
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="holo" aria-hidden="true" ref={ref}>
      GUVIRA
    </div>
  );
}
