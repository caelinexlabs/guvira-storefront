import Link from "next/link";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SortMenu } from "@/components/sort-menu";
import { Heading, PillLink } from "@/components/ui";
import { listProducts } from "@/lib/commerce";
import { shopHref } from "@/lib/commerce/query";
import type {
  Category,
  Facet,
  PriceRange,
  Product,
  ShopQuery,
  Sort,
} from "@/lib/commerce/types";
import { FilterPanel } from "./filter-panel";

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
          <div className="filter-bar">
            <nav className="chips chips-cat" aria-label="Category">
              <Link
                href={shopHref({ ...query, category: undefined })}
                aria-current={!current ? "page" : undefined}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={shopHref({ ...query, category: c.slug })}
                  aria-current={current?.slug === c.slug ? "page" : undefined}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
            <FilterPanel
              query={query}
              facets={facets}
              priceRange={priceRange}
            />
          </div>
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
          <ul className="shop-grid">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              </li>
            ))}
          </ul>
        ) : (
          <Empty
            title={{ script: "still being", caps: "Polished" }}
            text={`Our ${current?.name.toLowerCase() ?? "pieces"} are still in the polishing room. They’ll be here soon; until then, these are ready to wear.`}
            action={{ href: "/shop", label: "See all jewellery" }}
            picks={picks}
          />
        )}
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
