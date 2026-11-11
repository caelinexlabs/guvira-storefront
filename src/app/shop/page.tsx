import type { Metadata } from "next";
import { browseProducts, listCategories } from "@/lib/commerce";
import { parseShopQuery } from "@/lib/commerce/query";
import { ShopView } from "./shop-view";

export const metadata: Metadata = {
  title: "Shop all jewellery",
  description:
    "Anti-tarnish, waterproof jewellery: rings, necklaces, cuffs, earrings and pendants.",
  alternates: { canonical: "/shop" },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: Props) {
  const query = parseShopQuery(await searchParams);
  const [categories, { products, facets, priceRange }] = await Promise.all([
    listCategories(),
    browseProducts(query),
  ]);
  return (
    <ShopView
      categories={categories}
      products={products}
      facets={facets}
      priceRange={priceRange}
      query={query}
    />
  );
}
