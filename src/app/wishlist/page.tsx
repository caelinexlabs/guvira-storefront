import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Heading } from "@/components/ui";
import { getShopSettings } from "@/lib/caelinex/settings";
import { listProducts } from "@/lib/commerce";
import { WishlistGrid } from "./wishlist-grid";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false },
};

export default async function WishlistPage() {
  // The owner switches the wishlist on or off in the admin.
  if (!(await getShopSettings()).features.wishlist) notFound();
  const products = await listProducts();
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap">
        <header className="shop-head">
          <Heading as="h1" script="saved" caps="Wishlist" />
          <p>Pieces you’ve saved on this device.</p>
        </header>
        <WishlistGrid products={products} />
      </main>
      <SiteFooter />
    </>
  );
}
