"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { type ReorderPiece, reorderPieces } from "@/app/orders/reorder";
import { goToRazorpay } from "@/lib/razorpay-redirect";
import { useShop } from "@/lib/store/shop";
import { PillButton } from "./ui";

/** Puts an earlier order's pieces back in the bag and opens it. */
export function ReorderButton({
  pieces,
  tone = "dark",
}: {
  pieces: ReorderPiece[];
  tone?: "dark" | "light";
}) {
  const [pending, start] = useTransition();
  const add = useShop((s) => s.add);
  const openBag = useShop((s) => s.openBag);
  return (
    <PillButton
      tone={tone}
      className="sm"
      icon="bag"
      pending={pending}
      onClick={() =>
        start(async () => {
          const r = await reorderPieces(pieces);
          for (const { qty, ...line } of r.add) add(line, qty);
          if (r.missing.length)
            toast(
              r.missing.length === 1
                ? `${r.missing[0]} isn’t available any more, so it wasn’t added.`
                : `${r.missing.length} pieces aren’t available any more, so they weren’t added.`,
            );
          if (r.add.length) openBag(true);
        })
      }
    >
      Order again
    </PillButton>
  );
}

/** Reopens Razorpay for an order that was placed but not paid. */
export function PayNowButton({
  token,
  number,
  payment,
  prefill,
  backTo,
}: {
  token: string;
  number: number;
  payment: { keyId: string; razorpayOrderId: string };
  prefill: { name: string; email: string; contact: string };
  /** Where Razorpay's cancel link returns to. */
  backTo: string;
}) {
  const [pending, start] = useTransition();
  return (
    <PillButton
      tone="dark"
      className="sm"
      icon="arrow"
      pending={pending}
      onClick={() =>
        start(async () =>
          goToRazorpay(
            payment,
            { token, number: String(number) },
            prefill,
            backTo,
          ),
        )
      }
    >
      Pay now
    </PillButton>
  );
}
