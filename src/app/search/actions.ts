"use server";

import { HELP } from "@/content/help";
import { listCategories, searchProducts } from "@/lib/commerce";
import type { Prices, ProductImage } from "@/lib/commerce/types";

export type QuickResults = {
  products: {
    slug: string;
    name: string;
    line: string;
    image: ProductImage;
    prices: Prices;
  }[];
  categories: { slug: string; name: string }[];
  help: { slug: string; title: string }[];
};

/** Results for the ⌘K search: products, categories and help pages. */
export async function quickSearch(raw: string): Promise<QuickResults> {
  const q = String(raw ?? "")
    .trim()
    .slice(0, 80)
    .toLowerCase();
  if (!q) return { products: [], categories: [], help: [] };
  const [products, categories] = await Promise.all([
    searchProducts(q),
    listCategories(),
  ]);
  const starts = (text: string) =>
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .some(
        (w) =>
          w.startsWith(q) ||
          (w.length >= 4 && q.startsWith(w.replace(/s$/, ""))),
      );
  return {
    products: products.slice(0, 6).map((p) => ({
      slug: p.slug,
      name: p.name,
      line: p.line,
      image: p.images[0],
      prices: p.prices,
    })),
    categories: categories
      .filter((c) => starts(c.name))
      .map((c) => ({ slug: c.slug, name: c.name })),
    help: HELP.filter((h) => starts(h.title)).map((h) => ({
      slug: h.slug,
      title: h.title,
    })),
  };
}
