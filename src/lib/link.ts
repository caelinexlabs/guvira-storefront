/**
 * Addresses the owner types in the admin, mapped to this storefront's own
 * routes. Caelinex's defaults use /collections/... and /categories/...;
 * this site's shop lives at /shop.
 */
export function resolveLink(url: string): string {
  if (!url) return "/shop";
  if (/^https?:\/\//i.test(url)) return url;
  if (url === "/collections/all" || url.startsWith("/collections/"))
    return "/shop";
  const category = url.match(/^\/categories\/([\w-]+)/);
  if (category) return `/shop/${category[1]}`;
  return url;
}

export const isExternal = (url: string) => /^https?:\/\//i.test(url);
