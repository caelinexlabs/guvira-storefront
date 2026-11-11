import Link from "next/link";
import { getShopSettings } from "@/lib/caelinex/settings";
import { getContact } from "@/lib/contact";
import { getNavigation } from "@/lib/nav";
import { CurrencySelect } from "./currency-select";
import { FootTagline } from "./foot-tagline";
import { HoloMark } from "./holo-mark";
import { Icon } from "./icons";

const CARE_LINKS = [
  { href: "/help/shipping", label: "Shipping and returns" },
  { href: "/help/sizes", label: "Size guide" },
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
  const social = contact.social;
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
            {social.length > 0 && (
              <ul className="foot-social" aria-label="Guvira on social media">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      className="icon-btn"
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Guvira on ${s.label}`}
                    >
                      <Icon name={s.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {contact.email && (
              <a className="foot-mail" href={`mailto:${contact.email}`}>
                <Icon name="mail" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                className="foot-mail"
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
              >
                <Icon name="phone" />
                {contact.phone}
              </a>
            )}
          </div>
        </div>

        <HoloMark />
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
