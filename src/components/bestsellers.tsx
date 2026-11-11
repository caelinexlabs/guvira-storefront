"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { Icon } from "./icons";
import { ProductCard } from "./product-card";
import { Heading, PillLink } from "./ui";

/** "All" plus the three categories with the most pieces in this set. */
function tabsFor(products: Product[]) {
  const counts = new Map<string, { label: string; n: number }>();
  for (const p of products) {
    if (!p.category) continue;
    const c = counts.get(p.category) ?? { label: p.categoryName, n: 0 };
    c.n += 1;
    counts.set(p.category, c);
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 3)
    .map(([k, v]) => ({ k, label: v.label }));
  return [{ k: "all", label: "All" }, ...top];
}
const SPEED = 28; // px per second

/**
 * Dark bestsellers panel. The rail drifts slowly and loops (the set is drawn
 * twice); it pauses on hover, focus, touch, off screen and in hidden tabs,
 * and the pause button stops it for good.
 */
export function Bestsellers({
  products,
  autoScroll = true,
}: {
  products: Product[];
  /** The owner can switch the drifting rail off. */
  autoScroll?: boolean;
}) {
  const TABS = tabsFor(products);
  const [tab, setTab] = useState("all");
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [stopped, setStopped] = useState(!autoScroll);
  const stoppedRef = useRef(false);
  stoppedRef.current = stopped;
  const shown = products.filter((p) => tab === "all" || p.category === tab);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure the loop when the filter changes the cards
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos = 0;
    let setW = 0;
    let hover = false;
    let focus = false;
    let onScreen = true;
    let holdUntil = 0;
    let last = performance.now();
    let raf = 0;
    const cards = () => [...el.querySelectorAll<HTMLElement>(".card")];
    const measure = () => {
      const all = cards();
      const firstClone = all.find((c) => c.hasAttribute("inert"));
      setW = firstClone ? firstClone.offsetLeft - all[0].offsetLeft : 0;
      const loops = setW > el.clientWidth + 2;
      el.classList.toggle("static", !loops);
      if (!loops) {
        setW = 0;
        pos = 0;
        el.scrollLeft = 0;
      }
    };
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      if (
        !setW ||
        reduce ||
        stoppedRef.current ||
        hover ||
        focus ||
        !onScreen ||
        document.hidden ||
        t < holdUntil
      )
        return;
      pos += SPEED * dt;
      if (pos >= setW) pos -= setW;
      el.scrollLeft = pos;
    };
    const onScroll = () => {
      if (!setW) return;
      // Our own writes land within a pixel of pos; anything else is the shopper.
      if (Math.abs(el.scrollLeft - pos) > 1.5) {
        if (el.scrollLeft >= setW) el.scrollLeft -= setW;
        else if (el.scrollLeft <= 0) el.scrollLeft += setW;
        pos = el.scrollLeft;
      }
      bar.current?.style.setProperty(
        "--rp",
        ((el.scrollLeft % setW) / setW).toFixed(3),
      );
    };
    const hold = (ms: number) => {
      holdUntil = performance.now() + ms;
    };
    const on = (type: string, fn: () => void) => {
      el.addEventListener(type, fn, { passive: true });
      return () => el.removeEventListener(type, fn);
    };
    const offs = [
      on("scroll", onScroll),
      on("pointerenter", () => {
        if (matchMedia("(hover: hover)").matches) hover = true;
      }),
      on("pointerleave", () => {
        hover = false;
      }),
      on("focusin", () => {
        focus = true;
      }),
      on("focusout", () => {
        focus = false;
      }),
      on("pointerdown", () => hold(4000)),
      on("touchstart", () => hold(4000)),
      on("wheel", () => hold(3000)),
    ];
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
    });
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    raf = requestAnimationFrame(frame);
    (el as HTMLDivElement & { nudge?: (d: number) => void }).nudge = (
      dir: number,
    ) => {
      hold(3500);
      if (!setW) return;
      const c = cards()[0];
      const step = c ? c.offsetWidth + 20 : 300;
      if (dir < 0 && el.scrollLeft < step) el.scrollLeft += setW;
      el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
    };
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      for (const off of offs) off();
    };
  }, [tab]);

  const nudge = (d: number) =>
    (
      rail.current as (HTMLDivElement & { nudge?: (d: number) => void }) | null
    )?.nudge?.(d);

  return (
    <section className="sec panel-wrap" id="bestsellers" aria-labelledby="bs-h">
      <div className="panel">
        <div className="sec-head">
          <Heading
            script="the"
            caps="Bestsellers"
            className="on-dark"
            id="bs-h"
          />
          <div
            className="filter"
            role="tablist"
            aria-label="Filter bestsellers"
          >
            {TABS.map((t) => (
              <button
                key={t.k}
                type="button"
                role="tab"
                aria-selected={tab === t.k}
                tabIndex={tab === t.k ? 0 : -1}
                onClick={() => setTab(t.k)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rail" ref={rail}>
          <div className="rail-track">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {shown.map((p) => (
              <ProductCard key={`${p.id}-clone`} product={p} clone />
            ))}
          </div>
        </div>
        <div className="rail-ctrl">
          <span className="rail-progress" aria-hidden="true" ref={bar}>
            <b />
          </span>
          <div className="rail-arrows">
            <button
              className="icon-btn rail-pause"
              type="button"
              aria-label={stopped ? "Resume scrolling" : "Pause scrolling"}
              onClick={() => setStopped((v) => !v)}
            >
              <Icon name={stopped ? "play" : "pause"} />
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label="Previous pieces"
              onClick={() => nudge(-1)}
            >
              <Icon name="chev" style={{ transform: "scaleX(-1)" }} />
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label="Next pieces"
              onClick={() => nudge(1)}
            >
              <Icon name="chev" />
            </button>
          </div>
          <PillLink href="/shop" className="rail-all">
            Explore collection
          </PillLink>
        </div>
      </div>
    </section>
  );
}
