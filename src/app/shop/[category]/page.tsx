import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { browseProducts, getCategory, listCategories } from "@/lib/commerce";
import { parseShopQuery } from "@/lib/commerce/query";
import { ShopView } from "../shop-view";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategory((await params).category);
  if (!c) return {};
  return {
    title: c.name,
    description:
      c.blurb ||
      `Anti-tarnish, waterproof ${c.name.toLowerCase()} from Guvira.`,
    alternates: { canonical: `/shop/${c.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const current = await getCategory((await params).category);
  if (!current) notFound();
  const query = parseShopQuery(await searchParams, current.slug);
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
      current={current}
      query={query}
    />
  );
}
