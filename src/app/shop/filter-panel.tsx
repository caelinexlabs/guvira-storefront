import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatMoney } from "@/lib/commerce/money";
import { queryParams, shopHref, toggleChoice } from "@/lib/commerce/query";
import type { Facet, PriceRange, ShopQuery } from "@/lib/commerce/types";
import { FilterDisclosure } from "./filter-disclosure";

/**
 * The filters Caelinex offers for this view, as links so they work without
 * JavaScript. A filter with no choices isn't drawn; nothing is invented.
 */
export function FilterPanel({
  query,
  facets,
  priceRange,
}: {
  query: ShopQuery;
  facets: Facet[];
  priceRange?: PriceRange;
}) {
  const active =
    Object.keys(query.attrs).length > 0 ||
    query.minPrice != null ||
    query.maxPrice != null ||
    query.inStock;
  const hidden = [...queryParams(query).entries()].filter(
    ([k]) => k !== "minPrice" && k !== "maxPrice",
  );
  const showPrice = priceRange && priceRange.max > priceRange.min;

  if (!facets.length && !showPrice && !active) return null;
  const count =
    Object.values(query.attrs).reduce((n, l) => n + l.length, 0) +
    (query.minPrice != null || query.maxPrice != null ? 1 : 0) +
    (query.inStock ? 1 : 0);
  return (
    <FilterDisclosure active={count}>
      <div className="facets">
        {facets.map((f) => (
          <nav className="facet" key={f.code} aria-label={f.name}>
            {f.type !== "BOOLEAN" && (
              <span className="facet-name">{f.name}</span>
            )}
            <span className="chips chips-quiet">
              {f.values.map((v) => (
                <Link
                  key={v.slug}
                  href={shopHref(toggleChoice(query, f.code, v.slug))}
                  aria-current={v.selected ? "true" : undefined}
                  rel="nofollow"
                >
                  {v.swatch && (
                    <i
                      className="facet-dot"
                      style={{ background: v.swatch }}
                      aria-hidden="true"
                    />
                  )}
                  {f.type === "BOOLEAN" && v.slug === "true" ? f.name : v.label}
                  <small>{v.count}</small>
                  {v.selected && <Icon name="close" />}
                </Link>
              ))}
            </span>
          </nav>
        ))}
        <div className="facet facet-misc">
          <span className="chips chips-quiet">
            <Link
              href={shopHref({
                ...query,
                inStock: query.inStock ? undefined : true,
              })}
              aria-current={query.inStock ? "true" : undefined}
              rel="nofollow"
            >
              In stock only
              {query.inStock && <Icon name="close" />}
            </Link>
          </span>
          {showPrice && (
            <form
              className="price-filter"
              action={shopHref({
                ...query,
                minPrice: undefined,
                maxPrice: undefined,
                attrs: {},
                sort: "relevance",
                inStock: undefined,
              })}
              method="get"
            >
              {hidden.map(([k, v]) => (
                <input key={`${k}-${v}`} type="hidden" name={k} value={v} />
              ))}
              <label>
                <span className="vh">Lowest price</span>
                <input
                  name="minPrice"
                  inputMode="numeric"
                  placeholder={formatMoney(
                    priceRange.min,
                    priceRange.currency as "INR",
                  )}
                  defaultValue={query.minPrice}
                />
              </label>
              <span aria-hidden="true">to</span>
              <label>
                <span className="vh">Highest price</span>
                <input
                  name="maxPrice"
                  inputMode="numeric"
                  placeholder={formatMoney(
                    priceRange.max,
                    priceRange.currency as "INR",
                  )}
                  defaultValue={query.maxPrice}
                />
              </label>
              <button type="submit">Apply</button>
            </form>
          )}
          {active && (
            <Link
              href={shopHref({
                category: query.category,
                sort: query.sort,
                attrs: {},
              })}
              rel="nofollow"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>
    </FilterDisclosure>
  );
}
