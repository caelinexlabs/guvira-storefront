"use client";

import { Dialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { bagCount, useShop } from "@/lib/store/shop";
import { CurrencySelect } from "./currency-select";
import { Icon } from "./icons";
import { SearchCommand } from "./search-command";
import { useShopConfig } from "./shop-config";

type Me = { signedIn: boolean; name: string };

/**
 * The emerald band: the owner's announcement line, then links on the left, the
 * logo in the middle and the tools on the right. The line folds away once the
 * page scrolls. Shop opens a panel with the categories and one featured piece.
 */
export function SiteHeader() {
  const { nav, wishlist, search, logo, announcement, menu } = useShopConfig();
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [me, setMe] = useState<Me>();
  const count = useShop((s) => bagCount(s.bag));
  const openBag = useShop((s) => s.openBag);
  const menu_ = menu;
  const hasPanel = menu_.categories.length > 0 || !!menu_.featured;

  // Who's signed in, for the account link and the phone menu.
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : undefined))
      .then((m: Me | undefined) => m && setMe(m))
      .catch(() => {});
  }, []);
  const firstName = me?.signedIn ? me.name.split(/[\s@]/)[0] : "";

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // A new page, or Escape, closes the Shop panel.
  // biome-ignore lint/correctness/useExhaustiveDependencies: close when the address changes
  useEffect(() => setShopOpen(false), [pathname]);
  useEffect(() => {
    const el = ref.current;
    const close = () => setShopOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // Leaving the header, or tabbing out of it, closes the panel too.
    const onBlur = (e: FocusEvent) => {
      if (!el?.contains(e.relatedTarget as Node | null)) close();
    };
    addEventListener("keydown", onKey);
    el?.addEventListener("pointerleave", close);
    el?.addEventListener("focusout", onBlur);
    return () => {
      removeEventListener("keydown", onKey);
      el?.removeEventListener("pointerleave", close);
      el?.removeEventListener("focusout", onBlur);
    };
  }, []);

  const note = announcement.text ? (
    announcement.href ? (
      <Link
        href={announcement.href}
        {...(announcement.external
          ? { rel: "noopener", target: "_blank" }
          : {})}
      >
        {announcement.text}
      </Link>
    ) : (
      <span>{announcement.text}</span>
    )
  ) : null;

  return (
    <header ref={ref} className={clsx("nav", scrolled && "scrolled")}>
      {note && (
        <div className="nav-note">
          <div>
            <p>{note}</p>
          </div>
        </div>
      )}
      <div className="wrap nav-in">
        <nav className="links" aria-label="Shop">
          {hasPanel ? (
            <button
              type="button"
              aria-expanded={shopOpen}
              aria-controls="shop-panel"
              onClick={() => setShopOpen((o) => !o)}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setShopOpen(true);
              }}
            >
              Shop
            </button>
          ) : (
            <Link href="/shop">Shop</Link>
          )}
          {nav.slice(0, 2).map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link className="logo" href="/" aria-label="Guvira home">
          {logo ? (
            // biome-ignore lint/performance/noImgElement: the owner's logo, from the Caelinex host
            <img src={logo} alt="Guvira" />
          ) : (
            "Guvira"
          )}
        </Link>
        <div className="tools">
          {search && <SearchCommand />}
          <Link
            className="icon-btn icon-btn-account"
            href={me?.signedIn ? "/account" : "/account/sign-in"}
            aria-label={me?.signedIn ? `Your account, ${firstName}` : "Sign in"}
            title={me?.signedIn ? `Signed in as ${me.name}` : "Sign in"}
          >
            <Icon name="user" />
            {me?.signedIn && <i className="me-dot" aria-hidden="true" />}
          </Link>
          {wishlist && (
            <Link
              className="icon-btn icon-btn-wish"
              href="/wishlist"
              aria-label="Wishlist"
            >
              <Icon name="heart" />
            </Link>
          )}
          <button
            className="icon-btn icon-btn-bag"
            type="button"
            aria-label={`Open bag, ${count} items`}
            onClick={() => openBag(true)}
          >
            <Icon name="bag" />
            <span
              key={count}
              className="count"
              data-empty={count === 0}
              suppressHydrationWarning
            >
              {count}
            </span>
          </button>
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger className="icon-btn menu-btn" aria-label="Menu">
              <Icon name="menu" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="sheet-scrim" />
              <Dialog.Popup className="sheet sheet-left">
                <div className="sheet-head">
                  <Dialog.Title className="sheet-title">menu</Dialog.Title>
                  <Dialog.Close className="icon-btn" aria-label="Close menu">
                    <Icon name="close" />
                  </Dialog.Close>
                </div>
                {/* Signed out: sign-in comes first. Signed in: who and where. */}
                {me?.signedIn ? (
                  <Link
                    className="sheet-me"
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="sheet-me-ic">
                      {firstName.slice(0, 1).toUpperCase() || (
                        <Icon name="user" />
                      )}
                    </span>
                    <span>
                      <b>Hi, {firstName}</b>
                      <small>Your account and orders</small>
                    </span>
                    <Icon name="chev" />
                  </Link>
                ) : (
                  <Link
                    className="sheet-me"
                    href="/account/sign-in"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="sheet-me-ic">
                      <Icon name="user" />
                    </span>
                    <span>
                      <b>Sign in or create an account</b>
                      <small>Track orders and get members’ offers</small>
                    </span>
                    <Icon name="chev" />
                  </Link>
                )}
                <nav className="sheet-nav" aria-label="Categories">
                  <Link href="/shop" onClick={() => setMenuOpen(false)}>
                    All jewellery <Icon name="chev" />
                  </Link>
                  {nav.map((n) => (
                    <Link
                      key={n.label}
                      href={n.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {n.label} <Icon name="chev" />
                    </Link>
                  ))}
                  {wishlist && (
                    <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
                      Wishlist <Icon name="chev" />
                    </Link>
                  )}
                </nav>
                <div className="sheet-currency">
                  <span>Currency</span>
                  <CurrencySelect />
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
      {hasPanel && (
        <div
          id="shop-panel"
          className="nav-mega"
          data-open={shopOpen || undefined}
          inert={!shopOpen}
        >
          <div>
            <h2>Shop by type</h2>
            <ul className="mega-cats">
              <li>
                <Link href="/shop">
                  <span className="mega-photo">
                    <Icon name="spark" />
                  </span>
                  All jewellery
                </Link>
              </li>
              {menu_.categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`}>
                    <span className="mega-photo">
                      {c.image ? (
                        <Image
                          src={c.image}
                          alt=""
                          width={80}
                          height={80}
                          sizes="80px"
                        />
                      ) : (
                        <span aria-hidden="true">{c.name.charAt(0)}</span>
                      )}
                    </span>
                    {c.name}
                    <small>
                      {c.count} {c.count === 1 ? "piece" : "pieces"}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {menu_.featured && (
            <div>
              <h2>New in</h2>
              <Link
                className="mega-feat"
                href={`/products/${menu_.featured.slug}`}
              >
                <Image
                  src={menu_.featured.image}
                  alt=""
                  width={120}
                  height={120}
                  sizes="120px"
                />
                <span>
                  <b>{menu_.featured.name}</b>
                  {menu_.featured.line && <small>{menu_.featured.line}</small>}
                  <u>Explore collection</u>
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
