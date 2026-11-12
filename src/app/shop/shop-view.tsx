import Link from "next/link";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SortMenu } from "@/components/sort-menu";
import { Heading, PillLink } from "@/components/ui";
import { listProducts } from "@/lib/commerce";
import { formatMoney } from "@/lib/commerce/money";
import { shopHref, toggleChoice } from "@/lib/commerce/query";
import type {
  Category,
  Facet,
  PriceRange,
  Product,
  ShopQuery,
  Sort,
} from "@/lib/commerce/types";
import { filterCount, ShopDock } from "./shop-dock";

const SORT_LABEL: Record<Sort, string> = {
  relevance: "Relevance",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
};

/** Shared by /shop and /shop/[category]. Every filter is a link, so it works without JavaScript. */
export async function ShopView({
  categories,
  products,
  facets,
  priceRange,
  current,
  query,
}: {
  categories: Category[];
  products: Product[];
  facets: Facet[];
  priceRange?: PriceRange;
  current?: Category;
  query: ShopQuery;
}) {
  const count = `${products.length} ${products.length === 1 ? "piece" : "pieces"}`;
  // Nothing matched: offer pieces that are ready now instead of a dead end.
  const picks = products.length
    ? []
    : (await listProducts({ sort: "relevance" })).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap shop-page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          {current ? (
            <>
              <Link href="/shop">Shop</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{current.name}</span>
            </>
          ) : (
            <span aria-current="page">Shop</span>
          )}
        </nav>

        <header className="shop-head">
          <Heading
            as="h1"
            script={current ? "shop" : "all"}
            caps={current ? current.name : "Jewellery"}
          />
          <p>
            {current?.blurb ||
              "Anti-tarnish, waterproof jewellery, curated for every day."}
          </p>
        </header>

        <div className="shop-tools">
          <AppliedFilters
            query={query}
            facets={facets}
            current={current}
            priceRange={priceRange}
          />
          <div className="results-row">
            <p className="result-count" aria-live="polite">
              {products.length > 0 && count}
            </p>
            <SortMenu
              label={SORT_LABEL[query.sort]}
              options={(Object.keys(SORT_LABEL) as Sort[]).map((x) => ({
                href: shopHref({ ...query, sort: x }),
                label: SORT_LABEL[x],
                current: query.sort === x,
              }))}
            />
          </div>
        </div>

        {products.length ? (
          <ul className="shop-grid" id="shop-results">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              </li>
            ))}
          </ul>
        ) : filterCount(query) > 0 ? (
          <Empty
            title={{ script: "nothing in", caps: "That mix" }}
            text="No piece has all of those at once. Loosen the price or pick another colour."
            action={{
              href: shopHref({
                category: query.category,
                sort: query.sort,
                attrs: {},
              }),
              label: "Clear all filters",
            }}
            picks={picks}
          />
        ) : (
          <Empty
            title={{ script: "still being", caps: "Polished" }}
            text={`Our ${current?.name.toLowerCase() ?? "pieces"} are still in the polishing room. They’ll be here soon; until then, these are ready to wear.`}
            action={{ href: "/shop", label: "See all jewellery" }}
            picks={picks}
          />
        )}
        <ShopDock
          categories={categories}
          current={current}
          query={query}
          facets={facets}
          priceRange={priceRange}
          shown={products.length}
        />
      </main>
      <SiteFooter />
    </>
  );
}

function Empty({
  title,
  text,
  action,
  picks,
}: {
  title: { script: string; caps: string };
  text: string;
  action: { href: string; label: string };
  picks: Product[];
}) {
  return (
    <section className="shop-empty" aria-labelledby="empty-h">
      <span className="shop-empty-mark" aria-hidden="true">
        <Icon name="spark" />
      </span>
      <Heading as="h2" id="empty-h" script={title.script} caps={title.caps} />
      <p>{text}</p>
      <PillLink href={action.href} tone="dark">
        {action.label}
      </PillLink>
      {picks.length > 0 && (
        <div className="shop-empty-picks">
          <h3>Ready to wear now</h3>
          <ul className="shop-grid">
            {picks.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** What is switched on, each one a link that takes it off. */
function AppliedFilters({
  query,
  facets,
  current,
  priceRange,
}: {
  query: ShopQuery;
  facets: Facet[];
  current?: Category;
  priceRange?: PriceRange;
}) {
  const items: { key: string; label: string; href: string; swatch?: string }[] =
    [];
  if (current)
    items.push({
      key: "category",
      label: current.name,
      href: shopHref({ ...query, category: undefined }),
    });
  for (const f of facets)
    for (const v of f.values)
      if (v.selected)
        items.push({
          key: `${f.code}-${v.slug}`,
          label: f.type === "BOOLEAN" ? f.name : v.label,
          swatch: v.swatch,
          href: shopHref(toggleChoice(query, f.code, v.slug)),
        });
  if (query.minPrice != null || query.maxPrice != null) {
    const money = (n: number) => formatMoney(n, priceRange?.currency ?? "INR");
    const { minPrice: lo, maxPrice: hi } = query;
    items.push({
      key: "price",
      label:
        lo != null && hi != null
          ? `${money(lo)} to ${money(hi)}`
          : lo != null
            ? `From ${money(lo)}`
            : `Up to ${money(hi ?? 0)}`,
      href: shopHref({ ...query, minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (query.inStock)
    items.push({
      key: "stock",
      label: "In stock",
      href: shopHref({ ...query, inStock: undefined }),
    });
  if (!items.length) return null;
  return (
    <ul className="applied" aria-label="Filters on">
      {items.map((i) => (
        <li key={i.key}>
          <Link
            href={i.href}
            scroll={false}
            rel="nofollow"
            aria-label={`Remove ${i.label}`}
          >
            {i.swatch && (
              <i
                className="dock-orb"
                style={{ "--c": i.swatch } as React.CSSProperties}
                aria-hidden="true"
              />
            )}
            {i.label}
            <Icon name="close" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
