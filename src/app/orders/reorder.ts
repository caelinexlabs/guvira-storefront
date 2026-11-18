"use server";

import { getProduct } from "@/lib/commerce";
import type { BagLine } from "@/lib/store/shop";

export type ReorderPiece = { slug: string; qty: number; size?: string | null };

export type ReorderResult = {
  /** Pieces that can go back in the bag, as the shop sells them now. */
  add: BagLine[];
  /** Names of pieces the shop no longer sells or has no price for. */
  missing: string[];
};

const SLUG = /^[\w-]{1,120}$/;

/**
 * An earlier order's pieces, looked up again so the bag gets today's prices
 * and photos, not what was paid then. A piece the shop has withdrawn is
 * reported instead of being added.
 */
export async function reorderPieces(
  pieces: ReorderPiece[],
): Promise<ReorderResult> {
  const wanted = pieces
    .filter(
      (p) =>
        typeof p?.slug === "string" &&
        SLUG.test(p.slug) &&
        Number.isInteger(p.qty) &&
        p.qty > 0,
    )
    .slice(0, 20);
  const found = await Promise.all(
    wanted.map(async (p) => ({ p, product: await getProduct(p.slug) })),
  );
  const add: BagLine[] = [];
  const missing: string[] = [];
  for (const { p, product } of found) {
    if (!product?.priced) {
      missing.push(product?.name ?? p.slug.replace(/-/g, " "));
      continue;
    }
    add.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      line: product.line,
      image: product.images[0],
      prices: product.prices,
      size: p.size && product.sizes?.includes(p.size) ? p.size : undefined,
      qty: Math.min(p.qty, 10),
    });
  }
  return { add, missing };
}
