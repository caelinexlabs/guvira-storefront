"use client";

import { createContext, useContext } from "react";

export type NavLink = { href: string; label: string };

/** What the owner switched on or off in the Caelinex admin, for client components. */
export type ShopConfig = {
  nav: NavLink[];
  wishlist: boolean;
  search: boolean;
  cashOnDelivery: boolean;
  stickyAddToCart: boolean;
  deliveryCheck: boolean;
  sizeGuide: { enabled: boolean; text: string };
  /** The owner's logo, or empty for the text wordmark. */
  logo: string;
  promises: { icon: string; title: string; text: string }[];
  /** The owner's announcement line, shown inside the header band. */
  announcement: { text: string; href?: string; external: boolean };
  /** What the Shop panel in the header shows. */
  menu: {
    categories: { slug: string; name: string; count: number; image?: string }[];
    featured?: { slug: string; name: string; line: string; image: string };
  };
};

const OFF: ShopConfig = {
  nav: [],
  wishlist: false,
  search: true,
  cashOnDelivery: false,
  stickyAddToCart: true,
  deliveryCheck: false,
  sizeGuide: { enabled: false, text: "" },
  logo: "",
  promises: [],
  announcement: { text: "", external: false },
  menu: { categories: [] },
};

const Ctx = createContext<ShopConfig>(OFF);

export function ShopConfigProvider({
  value,
  children,
}: {
  value: ShopConfig;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useShopConfig = () => useContext(Ctx);
export const useNavLinks = () => useContext(Ctx).nav;
