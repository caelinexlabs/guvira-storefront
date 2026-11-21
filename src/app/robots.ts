import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/checkout",
        "/orders",
        "/account",
        "/search",
        "/wishlist",
        // Filter and sort pages repeat the shop page; their canonical points back to it.
        "/shop?*",
        "/shop/*?*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
