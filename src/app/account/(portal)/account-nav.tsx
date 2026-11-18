"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Icon, type IconName } from "@/components/icons";
import { useShop } from "@/lib/store/shop";

const subscribe = () => () => {};

type Item = { href: string; label: string; icon: IconName; count?: number };

/** The account's sections: a list beside the page on desktop, a strip of tabs on phones. */
export function AccountNav({
  orders,
  wishlist,
}: {
  orders?: number;
  wishlist: boolean;
}) {
  const path = usePathname();
  const saved = useShop((s) => s.wishlist.length);
  // The wishlist lives in this browser, so its count waits for the client.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const items: Item[] = [
    { href: "/account", label: "Overview", icon: "grid" },
    { href: "/account/orders", label: "Orders", icon: "bag", count: orders },
    ...(wishlist
      ? [
          {
            href: "/account/wishlist",
            label: "Wishlist",
            icon: "heart" as const,
            count: mounted ? saved : undefined,
          },
        ]
      : []),
    { href: "/account/details", label: "Details", icon: "user" },
  ];
  return (
    <nav className="acct-nav" aria-label="Account">
      {items.map((i) => {
        const on =
          i.href === "/account" ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
          >
            <Icon name={i.icon} />
            {i.label}
            {i.count ? <small>{i.count}</small> : null}
          </Link>
        );
      })}
    </nav>
  );
}
