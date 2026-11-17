import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WishlistGrid } from "@/app/wishlist/wishlist-grid";
import { getShopSettings } from "@/lib/caelinex/settings";
import { listProducts } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false },
};

export default async function AccountWishlist() {
  if (!(await getShopSettings()).features.wishlist) notFound();
  const products = await listProducts();
  return (
    <section aria-labelledby="wish-h">
      <h2 className="acct-h" id="wish-h">
        Wishlist
      </h2>
      <p className="acct-sub">
        Pieces you’ve saved. They follow you to any device you sign in on.
      </p>
      <WishlistGrid products={products} />
    </section>
  );
}
