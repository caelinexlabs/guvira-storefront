import { type ShopQuery, SORTS, type Sort } from "./types";

type RawParams = Record<string, string | string[] | undefined>;

const CODE = /^[\w-]{1,40}$/;

const asList = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const money = (v: string | string[] | undefined) => {
  const n = Number(asList(v)[0]);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** `attr=colour:pink,teal` (repeatable) into { colour: ["pink", "teal"] }. */
function parseAttrs(v: string | string[] | undefined) {
  const out: Record<string, string[]> = {};
  for (const raw of asList(v)) {
    const [code, choices] = raw.split(":");
    if (!CODE.test(code ?? "") || !choices) continue;
    const list = choices.split(",").filter((c) => CODE.test(c));
    if (list.length)
      out[code] = Array.from(new Set([...(out[code] ?? []), ...list]));
  }
  return out;
}

/** Turn URL search params into a ShopQuery. Unknown values are ignored, never thrown. */
export function parseShopQuery(
  params: RawParams,
  category?: string,
): ShopQuery {
  const sort = asList(params.sort)[0];
  return {
    category,
    sort: (SORTS as readonly string[]).includes(sort ?? "")
      ? (sort as Sort)
      : "relevance",
    attrs: parseAttrs(params.attr),
    minPrice: money(params.minPrice),
    maxPrice: money(params.maxPrice),
    inStock: asList(params.inStock)[0] === "true" ? true : undefined,
  };
}

/** The query as URL search params, in the form both this site and Caelinex read. */
export function queryParams(query: ShopQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.sort !== "relevance") params.set("sort", query.sort);
  for (const [code, list] of Object.entries(query.attrs))
    if (list.length) params.append("attr", `${code}:${list.join(",")}`);
  if (query.minPrice != null) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice != null) params.set("maxPrice", String(query.maxPrice));
  if (query.inStock) params.set("inStock", "true");
  return params;
}

/** Build a shop URL for a query, dropping defaults so links stay short. */
export function shopHref(query: ShopQuery): string {
  const path = query.category ? `/shop/${query.category}` : "/shop";
  const qs = queryParams(query).toString();
  return qs ? `${path}?${qs}` : path;
}

/** The query with one choice of one filter switched on or off. */
export function toggleChoice(
  query: ShopQuery,
  code: string,
  slug: string,
): ShopQuery {
  const now = query.attrs[code] ?? [];
  const next = now.includes(slug)
    ? now.filter((s) => s !== slug)
    : [...now, slug];
  const attrs = { ...query.attrs, [code]: next };
  if (!next.length) delete attrs[code];
  return { ...query, attrs };
}
