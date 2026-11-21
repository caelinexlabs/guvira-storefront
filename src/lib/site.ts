/** The shop's public web address, for canonical links, the sitemap and structured data. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** A path or an absolute address, as an absolute address on this site. */
export const absoluteUrl = (src: string) =>
  src.startsWith("http") ? src : `${SITE_URL}${src}`;

/** JSON-LD for a script tag: `<` is escaped so a value can't close the tag. */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
