import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { shopHref, toggleChoice } from "@/lib/commerce/query";
import type {
  Category,
  Facet,
  PriceRange,
  ShopQuery,
} from "@/lib/commerce/types";
import { DockPrice } from "./dock-price";

const swatchOf = (hex: string) => ({ "--c": hex }) as CSSProperties;
const hasSwatch = (f: Facet) => f.values.some((v) => v.swatch);

/** How many filters are on: each chosen value, the price range and in stock. */
export function filterCount(query: ShopQuery) {
  return (
    Object.values(query.attrs).reduce((n, l) => n + l.length, 0) +
    (query.minPrice != null || query.maxPrice != null ? 1 : 0) +
    (query.inStock ? 1 : 0)
  );
}

/**
 * The shop's filters in a dock that stays at the bottom of the screen: quick
 * colour dots, a Filters button that opens a sheet, and the number of pieces
 * on show. Every choice is a link, so it works without JavaScript; the sheet is
 * a native popover, so it opens and closes without any script either.
 */
export function ShopDock({
  categories,
  current,
  query,
  facets,
  priceRange,
}: {
  categories: Category[];
  current?: Category;
  query: ShopQuery;
  facets: Facet[];
  priceRange?: PriceRange;
  /** Pieces on show with the current filters. */
}) {
  const active = filterCount(query);
  const swatches = facets.filter(hasSwatch);
  // The dots on the bar come from the swatch filter with the most choices (colour).
  const quick = swatches.reduce<Facet | undefined>(
    (best, f) => (!best || f.values.length > best.values.length ? f : best),
    undefined,
  );
  const plain = facets.filter((f) => !hasSwatch(f) && f.type !== "BOOLEAN");
  const flags = facets.filter((f) => f.type === "BOOLEAN");
  const showPrice = !!priceRange && priceRange.max > priceRange.min;
  const clear = shopHref({
    category: query.category,
    sort: query.sort,
    attrs: {},
  });

  if (!categories.length && !facets.length && !showPrice && !active)
    return null;

  return (
    <div className="dock-wrap">
      <nav className="dock" aria-label="Filters">
        <button type="button" className="dock-main" popoverTarget="dock-sheet">
          <Icon name="sliders" />
          Filters
          {active > 0 && <span className="dock-badge">{active}</span>}
        </button>
        {quick && (
          <div className="dock-dots">
            {quick.values.slice(0, 8).map((v) => (
              <Link
                key={v.slug}
                href={shopHref(toggleChoice(query, quick.code, v.slug))}
                scroll={false}
                rel="nofollow"
                aria-label={`${v.label}, ${v.count}`}
                aria-current={v.selected ? "true" : undefined}
              >
                <span className="dock-orb" style={swatchOf(v.swatch ?? "")} />
              </Link>
            ))}
          </div>
        )}
        {active > 0 && (
          <Link className="dock-cta" href={clear} scroll={false}>
            Clear filters
          </Link>
        )}
      </nav>

      <section
        id="dock-sheet"
        className="dock-sheet"
        popover="auto"
        aria-label="Filter the shop"
      >
        {categories.length > 0 && (
          <section className="dock-col dock-type">
            <h3>Type</h3>
            <nav className="dock-types" aria-label="Category">
              <Link
                href={shopHref({ ...query, category: undefined })}
                aria-current={!current ? "page" : undefined}
              >
                <span className="dock-photo">
                  <span aria-hidden="true">all</span>
                </span>
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={shopHref({ ...query, category: c.slug })}
                  aria-current={current?.slug === c.slug ? "page" : undefined}
                >
                  <span className="dock-photo">
                    {c.image ? (
                      <Image
                        src={c.image.src}
                        alt=""
                        width={56}
                        height={56}
                        sizes="56px"
                      />
                    ) : (
                      <span aria-hidden="true">{c.name.charAt(0)}</span>
                    )}
                  </span>
                  {c.name}
                  <small>{c.count}</small>
                </Link>
              ))}
            </nav>
          </section>
        )}

        {swatches.map((f) => (
          <section
            className={`dock-col${f.values.length > 5 ? " dock-wide" : ""}`}
            key={f.code}
          >
            <h3>{f.name}</h3>
            <div className="dock-orbs">
              {f.values.map((v) => (
                <Link
                  key={v.slug}
                  href={shopHref(toggleChoice(query, f.code, v.slug))}
                  scroll={false}
                  rel="nofollow"
                  aria-current={v.selected ? "true" : undefined}
                >
                  <span className="dock-orb" style={swatchOf(v.swatch ?? "")} />
                  {v.label}
                  <small>{v.count}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {plain.map((f) => (
          <section className="dock-col" key={f.code}>
            <h3>{f.name}</h3>
            <div className="dock-pills">
              {f.values.map((v) => (
                <Link
                  key={v.slug}
                  href={shopHref(toggleChoice(query, f.code, v.slug))}
                  scroll={false}
                  rel="nofollow"
                  aria-current={v.selected ? "true" : undefined}
                >
                  {v.label}
                  <small>{v.count}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="dock-col">
          {showPrice && priceRange && (
            <>
              <h3>Price</h3>
              <DockPrice
                // A new price in the address, or a new range under other filters,
                // starts the slider again from what the address says.
                key={`${query.minPrice ?? ""}-${query.maxPrice ?? ""}-${priceRange.min}-${priceRange.max}`}
                base={shopHref({
                  ...query,
                  minPrice: undefined,
                  maxPrice: undefined,
                })}
                range={priceRange}
                low={query.minPrice}
                high={query.maxPrice}
              />
            </>
          )}
          <div className="dock-pills dock-flags">
            {flags.flatMap((f) =>
              f.values
                .filter((v) => v.slug === "true")
                .map((v) => (
                  <Link
                    key={`${f.code}-${v.slug}`}
                    href={shopHref(toggleChoice(query, f.code, v.slug))}
                    scroll={false}
                    rel="nofollow"
                    aria-current={v.selected ? "true" : undefined}
                  >
                    {f.name}
                    <small>{v.count}</small>
                  </Link>
                )),
            )}
            <Link
              href={shopHref({
                ...query,
                inStock: query.inStock ? undefined : true,
              })}
              scroll={false}
              rel="nofollow"
              aria-current={query.inStock ? "true" : undefined}
            >
              In stock only
            </Link>
          </div>
          {active > 0 && (
            <Link className="dock-clear" href={clear} scroll={false}>
              Clear all filters
            </Link>
          )}
        </section>
      </section>
    </div>
  );
}
