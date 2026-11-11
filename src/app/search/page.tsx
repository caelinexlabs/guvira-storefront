import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PillButton } from "@/components/ui";
import { searchProducts } from "@/lib/commerce";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const SUGGESTIONS = ["ring", "cuff", "earrings", "AD stones", "emerald"];

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? "";
  const results = q ? await searchProducts(q) : [];

  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap search-page">
        <h1 className="vh">Search</h1>
        <search>
          <form action="/search" className="search-box">
            <label className="vh" htmlFor="q">
              Search jewellery
            </label>
            <Icon name="search" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search rings, cuffs, earrings…"
              autoComplete="off"
            />
            <PillButton tone="dark" type="submit">
              Search
            </PillButton>
          </form>
        </search>

        {q ? (
          <p className="result-count" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"} for “
            {q}”
          </p>
        ) : null}

        {results.length ? (
          <ul className="shop-grid">
            {results.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="search-empty">
            <p>
              {q ? "Nothing matched. Try one of these:" : "Popular searches:"}
            </p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
