"use server";

import {
  type SyncResult,
  syncCart,
  type WantedLine,
} from "@/lib/caelinex/cart-sync";

export type BagSyncResult =
  | {
      status: "ok";
      /** What Caelinex holds, by product id. */
      held: { id: string; qty: number; issue: string | null }[];
      problems: { id: string; message: string }[];
    }
  | { status: "empty" | "unavailable" };

const clean = (lines: WantedLine[]) =>
  (Array.isArray(lines) ? lines : [])
    .filter(
      (l) =>
        typeof l?.id === "string" &&
        /^[0-9a-f]{32}$/.test(l.id) &&
        Number.isInteger(l.qty),
    )
    .map((l) => ({ id: l.id, qty: Math.min(Math.max(l.qty, 0), 99) }));

/** Called when the bag changes: mirror it into the Caelinex cart. */
export async function syncBag(lines: WantedLine[]): Promise<BagSyncResult> {
  const r: SyncResult = await syncCart(clean(lines));
  if (r.status !== "ok") return { status: r.status };
  return {
    status: "ok",
    held: r.cart.lines.map((l) => ({
      id: l.productId,
      qty: l.quantity,
      issue: l.issue,
    })),
    problems: r.problems,
  };
}
