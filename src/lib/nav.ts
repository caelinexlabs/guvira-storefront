import "server-only";
import { getShopSettings } from "@/lib/caelinex/settings";
import { listCategories } from "@/lib/commerce";

export type Link = { href: string; label: string };
export type Navigation = {
  /** Header and menu links. */
  header: Link[];
  /** Footer columns. */
  footer: { title: string; links: Link[] }[];
};

const link = (l: { label: string; url: string }): Link => ({
  href: l.url,
  label: l.label,
});

/**
 * What the owner set in Settings -> Storefront -> Navigation. Where a group
 * is empty, the shop's real categories stand in, so a link never points at a
 * category that doesn't exist.
 */
export async function getNavigation(): Promise<Navigation> {
  const [settings, categories] = await Promise.all([
    getShopSettings(),
    listCategories(),
  ]);
  const fromCategories: Link[] = categories
    .slice(0, 6)
    .map((c) => ({ href: `/shop/${c.slug}`, label: c.name }));
  const header = settings.navigation?.header?.length
    ? settings.navigation.header.map(link)
    : fromCategories;
  const footer = settings.navigation?.footer?.length
    ? settings.navigation.footer.map((g) => ({
        title: g.title,
        links: g.links.map(link),
      }))
    : [
        {
          title: "Shop",
          links: [{ href: "/shop", label: "Shop all" }, ...fromCategories],
        },
      ];
  return { header, footer };
}
