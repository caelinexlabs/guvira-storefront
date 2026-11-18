"use client";

import { useEffect, useRef, useState } from "react";

/** Copies text to the clipboard and says so for a moment. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className="text-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setDone(false), 2000);
        } catch {
          // No clipboard here; the number stays on the page to read out.
        }
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

/** Small helpers under the progress line: keep the order number, pass the tracking link on. */
export function OrderTools({
  orderNumber,
  trackingUrl,
  trackingNumber,
}: {
  orderNumber: number;
  trackingUrl?: string;
  trackingNumber?: string | null;
}) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);
  return (
    <div className="ord-tools">
      <CopyButton text={String(orderNumber)} label="Copy order number" />
      {trackingUrl &&
        (canShare ? (
          <button
            type="button"
            className="text-btn"
            onClick={() =>
              navigator
                .share({
                  title: `Order ${orderNumber}`,
                  text: trackingNumber
                    ? `Tracking number ${trackingNumber}`
                    : undefined,
                  url: trackingUrl,
                })
                .catch(() => {})
            }
          >
            Share tracking
          </button>
        ) : (
          <CopyButton text={trackingUrl} label="Copy tracking link" />
        ))}
    </div>
  );
}
