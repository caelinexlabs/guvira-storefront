import type { Metadata } from "next";
import { Bestsellers } from "@/components/bestsellers";
import { HeroVideo } from "@/components/hero-video";
import {
  CategoryTiles,
  Closing,
  Faq,
  Gallery,
  NewsletterSection,
  StoryBanner,
  TrustStrip,
} from "@/components/home-sections";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getShopSettings } from "@/lib/caelinex/settings";
import { listCategories, listProducts } from "@/lib/commerce";
import { getContact } from "@/lib/contact";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * The home page. Which blocks show, and what they say, is the owner's choice
 * in Settings -> Storefront: a block with its switch off, or with nothing to
 * show, is left out.
 */
export default async function Home() {
  const [settings, products, categories, contact] = await Promise.all([
    getShopSettings(),
    listProducts(),
    listCategories(),
    getContact(),
  ]);
  const s = settings.sections;
  const { hero } = settings;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Guvira",
              url: SITE_URL,
              logo: absoluteUrl("/brand/guvira-lotus-evergreen.png"),
              email: contact.email,
              sameAs: contact.social.map((l) => l.href),
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: "Guvira",
              url: SITE_URL,
              publisher: { "@id": `${SITE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <SiteHeader over />
      <main id="main">
        <HeroVideo content={hero} />
        {s.categoryStrip.enabled && categories.length > 0 && (
          <CategoryTiles categories={categories} />
        )}
        {s.bestSellers.enabled && products.length > 0 && (
          <Bestsellers
            products={products}
            autoScroll={s.bestSellers.autoScroll}
          />
        )}
        {s.trustStrip.enabled && s.trustStrip.items.length > 0 && (
          <TrustStrip items={s.trustStrip.items} />
        )}
        {s.storyBanner.enabled &&
          (s.storyBanner.heading || s.storyBanner.text) && (
            <StoryBanner
              media={s.storyBanner.media}
              heading={s.storyBanner.heading}
              text={s.storyBanner.text}
            />
          )}
        {s.gallery.enabled && s.gallery.media.length > 0 && (
          <Gallery heading={s.gallery.heading} media={s.gallery.media} />
        )}
        {s.faq.enabled && s.faq.items.length > 0 && <Faq items={s.faq.items} />}
        {s.newsletter.enabled && (
          <NewsletterSection
            heading={s.newsletter.heading}
            text={s.newsletter.text}
            instagram={contact.social.find((l) => l.icon === "instagram")?.href}
          />
        )}
        <Closing script="find your" caps="Favourite" />
      </main>
      <SiteFooter />
    </>
  );
}
