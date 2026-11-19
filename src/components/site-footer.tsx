import Link from "next/link";
import { getShopSettings } from "@/lib/caelinex/settings";
import { BRAND, getContact, isPlaceholder } from "@/lib/contact";
import { getNavigation } from "@/lib/nav";
import { CurrencySelect } from "./currency-select";
import { FootTagline } from "./foot-tagline";
import { Icon } from "./icons";

const CARE_LINKS = [
  { href: "/help/shipping", label: "Shipping and returns" },
  { href: "/help/care", label: "Jewellery care" },
  { href: "/help/contact", label: "Contact us" },
];

const accountLinks = (wishlist: boolean, search: boolean) => [
  { href: "/account", label: "Sign in" },
  { href: "/orders/track", label: "Track your order" },
  ...(wishlist ? [{ href: "/wishlist", label: "Wishlist" }] : []),
  ...(search ? [{ href: "/search", label: "Search" }] : []),
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** `slim` is for checkout: nothing to browse, just help and the small print. */
export async function SiteFooter({ slim = false }: { slim?: boolean }) {
  if (slim)
    return (
      <footer className="foot foot-slim">
        <div className="wrap">
          <div className="foot-base">
            <p className="foot-help">
              <Link href="/help/shipping">Shipping and returns</Link>
              <Link href="/help/contact">Contact us</Link>
            </p>
            <p>© {new Date().getFullYear()} Guvira</p>
          </div>
        </div>
      </footer>
    );
  const [{ footer }, { features }, contact] = await Promise.all([
    getNavigation(),
    getShopSettings(),
    getContact(),
  ]);
  const wa = isPlaceholder(features.whatsapp.number)
    ? BRAND.whatsapp
    : features.whatsapp.number;
  const waDigits = wa.replace(/\D/g, "");
  // Icons only: each one carries its own link, so no address or number is printed.
  const links = [
    ...contact.social.map((s) => ({
      key: s.label,
      label: s.label,
      href: s.href,
      icon: s.icon,
      external: true,
    })),
    ...(contact.email
      ? [
          {
            key: "email",
            label: "Email",
            href: `mailto:${contact.email}`,
            icon: "mail" as const,
            external: false,
          },
        ]
      : []),
    ...(waDigits
      ? [
          {
            key: "whatsapp",
            label: "WhatsApp",
            href: `https://wa.me/${waDigits}`,
            icon: "whatsapp" as const,
            external: true,
          },
        ]
      : []),
  ];
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-cols">
          {footer.map((g) => (
            <LinkColumn key={g.title} title={g.title} links={g.links} />
          ))}
          <LinkColumn title="Customer care" links={CARE_LINKS} />
          <LinkColumn
            title="Your Guvira"
            links={accountLinks(features.wishlist, features.search)}
          />
          <div className="foot-connect">
            <h2>Connect</h2>
            <p>New pieces and restocks land first on our socials.</p>
            {links.length > 0 && (
              <ul className="foot-social" aria-label="Find and contact Guvira">
                {links.map((l) => (
                  <li key={l.key}>
                    <a
                      className="icon-btn"
                      href={l.href}
                      {...(l.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      aria-label={
                        l.key === "email" || l.key === "whatsapp"
                          ? `${l.label} Guvira`
                          : `Guvira on ${l.label}`
                      }
                    >
                      <Icon name={l.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="foot-mark" aria-hidden="true">
          GUVIRA
        </div>
        <FootTagline />

        <div className="foot-base">
          <p>© {new Date().getFullYear()} Guvira</p>
          <div className="foot-currency">
            <span>Currency</span>
            <CurrencySelect />
          </div>
          <p className="foot-credit">
            Built by <span>Caelinex Labs</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
