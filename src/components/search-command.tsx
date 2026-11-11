"use client";

import { Dialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { type QuickResults, quickSearch } from "@/app/search/actions";
import { Icon } from "./icons";
import { Price } from "./price";
import { useNavLinks } from "./shop-config";

const POPULAR = ["Rings", "Hand cuffs", "AD stones", "Emerald", "Earrings"];
const EMPTY: QuickResults = { products: [], categories: [], help: [] };

type Hit = { href: string; key: string };

/**
 * Search everywhere. The header pill widens on hover; clicking it, or
 * ⌘K / Ctrl+K anywhere, opens a palette that searches products, categories
 * and help pages as you type. Arrow keys move, Enter opens.
 */
export function SearchCommand({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const nav = useNavLinks();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<QuickResults>(EMPTY);
  const [cursor, setCursor] = useState(0);
  const [pending, start] = useTransition();
  const [mac, setMac] = useState(true);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  // Search as they type, after a short pause.
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults(EMPTY);
      return;
    }
    const t = setTimeout(
      () =>
        start(async () => {
          setResults(await quickSearch(term));
          setCursor(0);
        }),
      140,
    );
    return () => clearTimeout(t);
  }, [q]);

  const term = q.trim();
  const hits: Hit[] = term
    ? [
        ...results.products.map((p) => ({
          href: `/products/${p.slug}`,
          key: `p-${p.slug}`,
        })),
        ...results.categories.map((c) => ({
          href: `/shop/${c.slug}`,
          key: `c-${c.slug}`,
        })),
        ...results.help.map((h) => ({
          href: `/help/${h.slug}`,
          key: `h-${h.slug}`,
        })),
        { href: `/search?q=${encodeURIComponent(term)}`, key: "all" },
      ]
    : [
        ...POPULAR.map((p) => ({
          href: `/search?q=${encodeURIComponent(p)}`,
          key: `s-${p}`,
        })),
        ...nav.slice(0, 6).map((n) => ({ href: n.href, key: `n-${n.href}` })),
      ];
  const index = (key: string) => hits.findIndex((h) => h.key === key);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        (cursor + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length;
      setCursor(next);
      list.current
        ?.querySelector(`[data-i="${next}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter" && hits[cursor]) {
      e.preventDefault();
      go(hits[cursor].href);
    }
  };
  const row = (key: string, href: string, children: React.ReactNode) => {
    const i = index(key);
    return (
      <li key={key}>
        <a
          href={href}
          data-i={i}
          className={clsx("cmd-row", i === cursor && "on")}
          onMouseMove={() => setCursor(i)}
          onClick={(e) => {
            e.preventDefault();
            go(href);
          }}
        >
          {children}
        </a>
      </li>
    );
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setQ("");
          setCursor(0);
        }
      }}
    >
      <Dialog.Trigger
        className={clsx("search-pill", compact && "icon-btn")}
        aria-label="Search jewellery"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <Icon name="search" />
        {!compact && (
          <span className="search-pill-text" aria-hidden="true">
            Search jewellery
            <kbd>{mac ? "⌘" : "Ctrl"} K</kbd>
          </span>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="cmd-scrim" />
        <Dialog.Popup className="cmd" aria-label="Search">
          <Dialog.Title className="vh">Search Guvira</Dialog.Title>
          <div className="cmd-input">
            <Icon name="search" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search rings, cuffs, AD stones, help…"
              aria-label="Search"
              aria-controls="cmd-list"
              autoComplete="off"
              spellCheck={false}
            />
            {pending && <span className="cmd-spin" aria-hidden="true" />}
            <Dialog.Close className="cmd-esc">Esc</Dialog.Close>
          </div>
          <div className="cmd-list" id="cmd-list" ref={list}>
            {!term && (
              <>
                <p className="cmd-label">Popular</p>
                <ul className="cmd-chips">
                  {POPULAR.map((p) =>
                    row(
                      `s-${p}`,
                      `/search?q=${encodeURIComponent(p)}`,
                      <>
                        <Icon name="search" />
                        {p}
                      </>,
                    ),
                  )}
                </ul>
                <p className="cmd-label">Shop by category</p>
                <ul>
                  {nav.slice(0, 6).map((n) =>
                    row(
                      `n-${n.href}`,
                      n.href,
                      <>
                        <span className="cmd-ic">
                          <Icon name="arrow" />
                        </span>
                        {n.label}
                        <Icon name="arrow" className="ico cmd-go" />
                      </>,
                    ),
                  )}
                </ul>
              </>
            )}
            {term && (
              <>
                {results.products.length > 0 && (
                  <>
                    <p className="cmd-label">Jewellery</p>
                    <ul>
                      {results.products.map((p) =>
                        row(
                          `p-${p.slug}`,
                          `/products/${p.slug}`,
                          <>
                            <Image
                              src={p.image.src}
                              alt=""
                              width={44}
                              height={44}
                              className="cmd-thumb"
                            />
                            <span className="cmd-text">
                              {p.name}
                              <small>{p.line}</small>
                            </span>
                            <Price prices={p.prices} className="cmd-price" />
                          </>,
                        ),
                      )}
                    </ul>
                  </>
                )}
                {results.categories.length > 0 && (
                  <>
                    <p className="cmd-label">Categories</p>
                    <ul>
                      {results.categories.map((c) =>
                        row(
                          `c-${c.slug}`,
                          `/shop/${c.slug}`,
                          <>
                            <span className="cmd-ic">
                              <Icon name="arrow" />
                            </span>
                            {c.name}
                            <Icon name="arrow" className="ico cmd-go" />
                          </>,
                        ),
                      )}
                    </ul>
                  </>
                )}
                {results.help.length > 0 && (
                  <>
                    <p className="cmd-label">Help</p>
                    <ul>
                      {results.help.map((h) =>
                        row(
                          `h-${h.slug}`,
                          `/help/${h.slug}`,
                          <>
                            <span className="cmd-ic">
                              <Icon name="alert" />
                            </span>
                            {h.title}
                            <Icon name="arrow" className="ico cmd-go" />
                          </>,
                        ),
                      )}
                    </ul>
                  </>
                )}
                {!pending &&
                  !results.products.length &&
                  !results.categories.length &&
                  !results.help.length && (
                    <p className="cmd-none">
                      Nothing matches “{term}” yet. Try a piece, a finish or a
                      stone.
                    </p>
                  )}
                <ul>
                  {row(
                    "all",
                    `/search?q=${encodeURIComponent(term)}`,
                    <>
                      <span className="cmd-ic">
                        <Icon name="search" />
                      </span>
                      See all results for “{term}”
                      <Icon name="arrow" className="ico cmd-go" />
                    </>,
                  )}
                </ul>
              </>
            )}
          </div>
          <div className="cmd-foot" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> move
            </span>
            <span>
              <kbd>↵</kbd> open
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
