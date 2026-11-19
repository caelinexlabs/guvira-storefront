"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

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

/** A value you tap to copy; a tick says so for five seconds. */
function CopyValue({
  value,
  aria,
  title,
}: {
  value: string;
  aria: string;
  title: string;
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <>
      <button
        type="button"
        className="ord-num"
        aria-label={aria}
        title={title}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setDone(false), 5000);
          } catch {
            // No clipboard here; the value stays on the page to read out.
          }
        }}
      >
        {value}
      </button>
      <output className="ord-copied">
        {done && (
          <>
            <Icon name="check" />
            Copied
          </>
        )}
      </output>
    </>
  );
}

/** The number in "Order 1012": tap it to copy. */
export function CopyOrderNumber({ number }: { number: number }) {
  return (
    <CopyValue
      value={String(number)}
      aria={`Order ${number}, copy order number`}
      title="Copy order number"
    />
  );
}

/** A parcel's tracking number: tap it to copy. */
export function CopyTrackingNumber({ number }: { number: string }) {
  return (
    <CopyValue
      value={number}
      aria={`Tracking number ${number}, copy tracking number`}
      title="Copy tracking number"
    />
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
  if (!trackingUrl) return null;
  return (
    <div className="ord-tools">
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
