"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/commerce/money";
import type { PriceRange } from "@/lib/commerce/types";

const WAIT_MS = 450;

/**
 * Two handles on one track. The page follows once the handles stop moving, so
 * dragging doesn't reload on every step. Without JavaScript the shop still
 * takes `minPrice` and `maxPrice` in the address.
 */
export function DockPrice({
  base,
  range,
  low,
  high,
}: {
  /** The shop address with every filter except the price. */
  base: string;
  range: PriceRange;
  low?: number;
  high?: number;
}) {
  const router = useRouter();
  const step = range.max - range.min >= 100 ? 10 : 1;
  const floor = Math.floor(range.min / step) * step;
  const ceil = Math.ceil(range.max / step) * step;
  const [lo, setLo] = useState(Math.max(low ?? floor, floor));
  const [hi, setHi] = useState(Math.min(high ?? ceil, ceil));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // What the address already says; moving the handles back to it sends nothing.
  const inUrl = {
    lo: Math.max(low ?? floor, floor),
    hi: Math.min(high ?? ceil, ceil),
  };

  useEffect(() => {
    if (lo === inUrl.lo && hi === inUrl.hi) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const url = new URL(base, "https://shop.invalid");
      if (lo > floor) url.searchParams.set("minPrice", String(lo));
      if (hi < ceil) url.searchParams.set("maxPrice", String(hi));
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    }, WAIT_MS);
    return () => clearTimeout(timer.current);
  }, [lo, hi, inUrl.lo, inUrl.hi, base, floor, ceil, router]);

  const pct = (n: number) =>
    Math.min(100, Math.max(0, ((n - floor) / (ceil - floor)) * 100));
  const money = (n: number) => formatMoney(n, range.currency);

  return (
    <div className="dock-price">
      <div
        className="dock-range"
        style={
          {
            "--lo": `${pct(lo)}%`,
            "--hi": `${pct(hi)}%`,
          } as React.CSSProperties
        }
      >
        <span className="dock-track" />
        <span className="dock-fill" />
        <input
          type="range"
          min={floor}
          max={ceil}
          step={step}
          value={lo}
          aria-label="Lowest price"
          onChange={(e) => setLo(Math.min(+e.target.value, hi - step))}
        />
        <input
          type="range"
          min={floor}
          max={ceil}
          step={step}
          value={hi}
          aria-label="Highest price"
          onChange={(e) => setHi(Math.max(+e.target.value, lo + step))}
        />
      </div>
      <p className="dock-prices">
        <span>
          From <b>{money(lo)}</b>
        </span>
        <span>
          to <b>{money(hi)}</b>
        </span>
      </p>
    </div>
  );
}
