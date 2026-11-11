import "server-only";
import { storefront } from "@/lib/caelinex/storefront";
import { queryParams } from "./query";
import {
  type Category,
  CURRENCIES,
  type Currency,
  type Facet,
  type PriceRange,
  type Prices,
  type Product,
  type ProductImage,
  type ShopQuery,
} from "./types";

// The one place pages ask for catalog data. It reads the Caelinex Storefront
// API and maps every answer to the types in ./types. When the API can't be
// reached the lists come back empty, so pages show their empty states.

const REVALIDATE = 60;
const NO_PHOTO: ProductImage = {
  src: "/products/no-photo.svg",
  alt: "Photo coming soon",
};

type RawImage = { url: string; alt?: string | null } | null;
type RawPrice = { currency: string; amount: number } | null;
type RawCard = {
  id: string;
  slug: string;
  name: string;
  category: { slug: string; name: string } | null;
  image: RawImage;
  price: RawPrice;
  available: boolean;
};
type RawDetail = RawCard & {
  description: string | null;
  media: { url: string; alt?: string | null }[];
  specs: unknown[];
};
type RawCategory = {
  slug: string;
  name: string;
  description: string | null;
  image: RawImage;
  productCount: number;
  children: RawCategory[];
};

const isCurrency = (c: string): c is Currency =>
  (CURRENCIES as readonly string[]).includes(c);

const photo = (i: RawImage, fallback: string): ProductImage | undefined =>
  i ? { src: i.url, alt: i.alt || fallback } : undefined;

/** A price of 0 means the shop hasn't priced it yet, so it gets no price at all. */
const pricesOf = (p: RawPrice): Prices =>
  p && p.amount > 0 && isCurrency(p.currency) ? { [p.currency]: p.amount } : {};

/** The first sentence of the description, kept short, for cards and meta tags. */
function summaryOf(description: string | null): string {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const first = text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;
  return first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first;
}

function specLine(spec: unknown): string | undefined {
  if (typeof spec === "string") return spec;
  if (spec && typeof spec === "object") {
    const s = spec as Record<string, unknown>;
    const name = s.name ?? s.label ?? s.key;
    const value = s.value;
    if (typeof name === "string" && value != null && value !== "")
      return `${name}: ${String(value)}`;
  }
  return undefined;
}

function toProduct(c: RawCard, d?: RawDetail): Product {
  const gallery = (d?.media ?? []).map((m) => ({
    src: m.url,
    alt: m.alt || c.name,
  }));
  const card = photo(c.image, c.name);
  const images = gallery.length ? gallery : card ? [card] : [NO_PHOTO];
  const description = d?.description ?? "";
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category?.slug ?? "",
    categoryName: c.category?.name ?? "",
    line: c.category?.name ?? "",
    summary: summaryOf(d?.description ?? null),
    description,
    details: (d?.specs ?? []).map(specLine).filter((x): x is string => !!x),
    prices: pricesOf(c.price),
    priced: (c.price?.amount ?? 0) > 0,
    images,
  };
}

type Page = {
  items: RawCard[];
  pages: number;
  facets?: {
    code: string;
    name: string;
    type: string;
    values: {
      slug: string;
      label: string;
      swatch?: string | null;
      count: number;
      selected: boolean;
    }[];
  }[];
  priceRange?: PriceRange | null;
};

export type Browse = {
  products: Product[];
  facets: Facet[];
  priceRange?: PriceRange;
};

/** Every product matching the params, across pages, with the first page's facets. */
async function browse(params: URLSearchParams): Promise<Browse> {
  const out: RawCard[] = [];
  let facets: Facet[] = [];
  let priceRange: PriceRange | undefined;
  for (let page = 1; page <= 10; page++) {
    const qs = new URLSearchParams(params);
    qs.set("page", String(page));
    qs.set("pageSize", "60");
    const r = await storefront<Page>(
      `/products?${qs}`,
      {},
      { revalidate: REVALIDATE },
    );
    if (!r.ok) break;
    out.push(...r.value.items);
    if (page === 1) {
      facets = (r.value.facets ?? [])
        .map((f) => ({
          ...f,
          values: f.values.map((v) => ({
            ...v,
            swatch: v.swatch ?? undefined,
          })),
        }))
        .filter((f) => f.values.length > 0);
      priceRange = r.value.priceRange ?? undefined;
    }
    if (page >= r.value.pages) break;
  }
  return { products: out.map((c) => toProduct(c)), facets, priceRange };
}

/** The shop page: products, the filters on offer and the price range. */
export function browseProducts(query: ShopQuery): Promise<Browse> {
  const params = queryParams(query);
  if (query.category) params.set("category", query.category);
  return browse(params);
}

export async function listProducts(
  query: Partial<Pick<ShopQuery, "category" | "sort">> = {},
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.sort) params.set("sort", query.sort);
  return (await browse(params)).products;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const r = await storefront<RawDetail>(
    `/products/${encodeURIComponent(slug)}`,
    {},
    { revalidate: REVALIDATE },
  );
  if (!r.ok) return undefined;
  return toProduct(r.value, r.value);
}

const toCategory = (c: RawCategory): Category => ({
  slug: c.slug,
  name: c.name,
  blurb: c.description?.trim() ?? "",
  image: photo(c.image, c.name),
  count: c.productCount,
});

/** Categories that have something to buy, top level first. */
export async function listCategories(): Promise<Category[]> {
  const r = await storefront<{ categories: RawCategory[] }>(
    "/categories",
    {},
    { revalidate: REVALIDATE },
  );
  if (!r.ok) return [];
  return r.value.categories.map(toCategory).filter((c) => c.count > 0);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const walk = (list: RawCategory[]): RawCategory | undefined => {
    for (const c of list) {
      if (c.slug === slug) return c;
      const hit = walk(c.children);
      if (hit) return hit;
    }
  };
  const r = await storefront<{ categories: RawCategory[] }>(
    "/categories",
    {},
    { revalidate: REVALIDATE },
  );
  if (!r.ok) return undefined;
  const hit = walk(r.value.categories);
  return hit && hit.productCount > 0 ? toCategory(hit) : undefined;
}

/** Pieces to show beside a product: same category first, then the rest. */
export async function relatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const same = product.category
    ? await listProducts({ category: product.category })
    : [];
  const pool = same.length > limit ? same : await listProducts();
  return pool.filter((p) => p.id !== product.id).slice(0, limit);
}

/** Search by words; Caelinex does the matching. */
export async function searchProducts(term: string): Promise<Product[]> {
  const q = term.trim();
  return q ? (await browse(new URLSearchParams({ q }))).products : [];
}

/** The currencies the shop sells in, default first. */
export async function getCurrencies(): Promise<Currency[]> {
  const r = await storefront<{
    channel: { defaultCurrency: string; currencies: string[] };
  }>("", {}, { revalidate: REVALIDATE });
  if (!r.ok) return ["INR"];
  const { defaultCurrency, currencies } = r.value.channel;
  const list = [defaultCurrency, ...currencies].filter(isCurrency);
  return Array.from(new Set(list));
}

export type { Category, Currency, Product } from "./types";
