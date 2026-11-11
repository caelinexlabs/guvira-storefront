import type { MetadataRoute } from "next";
import { HELP } from "@/content/help";
import { listCategories, listProducts } from "@/lib/commerce";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: `${BASE}/shop/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...HELP.map((h) => ({
      url: `${BASE}/help/${h.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
