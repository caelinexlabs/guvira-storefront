import { absoluteUrl, jsonLd } from "@/lib/site";

/** Structured data for search engines, built from our own catalog and settings. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: our own data, with "<" escaped by jsonLd
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}

/** A trail of pages from the home page; the last one is the page itself. */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path),
    })),
  };
}
