import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { BuyBox, ProductGallery } from "@/components/product-buy";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading, PillLink } from "@/components/ui";
import { getShopSettings } from "@/lib/caelinex/settings";
import { getCategory, getProduct, relatedProducts } from "@/lib/commerce";
import { priceFor } from "@/lib/commerce/price";
import type { Product } from "@/lib/commerce/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { images: [p.images[0].src] },
  };
}

/** Product structured data for search results, priced in the shop's own currency. */
function productJsonLd(p: Product) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const abs = (src: string) => (src.startsWith("http") ? src : `${site}${src}`);
  const { amount, currency } = priceFor(p.prices, "INR");
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.summary,
    image: p.images.map((i) => abs(i.src)),
    brand: { "@type": "Brand", name: "Guvira" },
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: amount,
      url: `${site}/products/${p.slug}`,
    },
  }).replace(/</g, "\\u003c");
}

/** Split a name into the script lead-in and the capitals line: "Emerald Heart" / "Wrap Ring". */
function splitName(name: string) {
  const words = name.split(" ");
  const cut = Math.max(1, Math.ceil(words.length / 2));
  return {
    script: words.slice(0, cut).join(" ").toLowerCase(),
    caps: words.slice(cut).join(" ") || name,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const [category, related] = await Promise.all([
    getCategory(product.category),
    relatedProducts(product),
  ]);
  const { productPage } = await getShopSettings();
  const sizeGuide = productPage.sizeGuide;
  const { script, caps } = splitName(product.name);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data for search engines, built from our own catalog
          dangerouslySetInnerHTML={{ __html: productJsonLd(product) }}
        />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            {category && (
              <>
                <Link href={`/shop/${category.slug}`}>{category.name}</Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span aria-current="page">{product.name}</span>
          </nav>
          <section className="pdp" aria-labelledby="p-h">
            <ProductGallery product={product} />
            <div className="buy">
              <Heading as="h1" id="p-h" script={script} caps={caps} />
              {product.summary && <p className="lead">{product.summary}</p>}
              <BuyBox product={product} />
              <div className="acc">
                {product.description && (
                  <details open>
                    <summary>
                      Description
                      <Icon name="plus" />
                    </summary>
                    <p>{product.description}</p>
                  </details>
                )}
                {sizeGuide.enabled && sizeGuide.text && (
                  <details id="size-guide">
                    <summary>
                      Size guide
                      <Icon name="plus" />
                    </summary>
                    <p>{sizeGuide.text}</p>
                  </details>
                )}
                {product.details.length > 0 && (
                  <details>
                    <summary>
                      Details
                      <Icon name="plus" />
                    </summary>
                    <ul>
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </details>
                )}
                <details>
                  <summary>
                    Shipping and returns
                    <Icon name="plus" />
                  </summary>
                  <p>
                    Shipping across India and to the UAE, Europe and Canada.
                    Delivery times and return terms will be shown here once
                    confirmed.
                  </p>
                </details>
              </div>
            </div>
          </section>
        </div>

        <section className="sec panel-wrap" aria-labelledby="pair-h">
          <div className="panel">
            <div className="sec-head">
              <Heading
                script="pairs"
                caps="Well with"
                className="on-dark"
                id="pair-h"
              />
              <PillLink href="/shop">View all</PillLink>
            </div>
            <div className="grid4">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  sizes="(max-width: 860px) 50vw, 25vw"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
