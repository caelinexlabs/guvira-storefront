"use client";

import { Dialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bagCount, useShop } from "@/lib/store/shop";
import { CurrencySelect } from "./currency-select";
import { Icon } from "./icons";
import { SearchCommand } from "./search-command";
import { useShopConfig } from "./shop-config";

type Me = { signedIn: boolean; name: string };

/**
 * `over` floats the header on the home video; it turns solid once the video
 * has scrolled under it. Other pages get the solid sticky header.
 */
export function SiteHeader({ over = false }: { over?: boolean }) {
  const { nav, wishlist, search, logo } = useShopConfig();
  const ref = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(!over);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [me, setMe] = useState<Me>();
  const count = useShop((s) => bagCount(s.bag));
  const openBag = useShop((s) => s.openBag);

  const bagOpen = useShop((s) => s.bagOpen);
  const [hidden, setHidden] = useState(false);
  const focusInside = useRef(false);

  // Who's signed in, for the account link and the phone menu.
  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : undefined))
      .then((m: Me | undefined) => m && setMe(m))
      .catch(() => {});
  }, []);
  const firstName = me?.signedIn ? me.name.split(/[\s@]/)[0] : "";

  useEffect(() => {
    const hero = over ? document.querySelector(".vhero-frame") : null;
    const bar = over ? document.querySelector(".announce") : null;
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      // The floating header sits just under the announcement bar while the
      // bar is on screen, then pins to the top as the bar scrolls away.
      if (bar && ref.current)
        ref.current.style.top = `${Math.max(0, bar.getBoundingClientRect().bottom)}px`;
      const h = ref.current?.offsetHeight ?? 80;
      setScrolled(y > 8);
      if (hero) setSolid(hero.getBoundingClientRect().bottom < h + 8);
      // Hide while scrolling down, return on any scroll up. Small movements
      // (under 6px) are ignored so trackpad jitter doesn't flicker it.
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      setHidden(delta > 0 && y > h * 2 && !focusInside.current);
      lastY = y;
    };
    // Keyboard users tabbing into the header always see it.
    const el = ref.current;
    const onFocusIn = () => {
      focusInside.current = true;
      setHidden(false);
    };
    const onFocusOut = () => {
      focusInside.current = false;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    el?.addEventListener("focusin", onFocusIn);
    el?.addEventListener("focusout", onFocusOut);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      el?.removeEventListener("focusin", onFocusIn);
      el?.removeEventListener("focusout", onFocusOut);
    };
  }, [over]);

  return (
    <header
      ref={ref}
      className={clsx(
        "nav",
        over && "over",
        over && solid && "solid",
        scrolled && "scrolled",
        hidden && !menu && !bagOpen && "hide",
      )}
    >
      <div className="wrap nav-in">
        <nav className="links" aria-label="Shop">
          <Link href="/shop">Shop</Link>
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
          <Dialog.Root open={menu} onOpenChange={setMenu}>
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
                    onClick={() => setMenu(false)}
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
                    onClick={() => setMenu(false)}
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
                  <Link href="/shop" onClick={() => setMenu(false)}>
                    All jewellery <Icon name="chev" />
                  </Link>
                  {nav.map((n) => (
                    <Link
                      key={n.label}
                      href={n.href}
                      onClick={() => setMenu(false)}
                    >
                      {n.label} <Icon name="chev" />
                    </Link>
                  ))}
                  {wishlist && (
                    <Link href="/wishlist" onClick={() => setMenu(false)}>
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
    </header>
  );
}
