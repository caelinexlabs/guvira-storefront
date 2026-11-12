import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Pinyon_Script, Urbanist } from "next/font/google";
import { Toaster } from "sonner";
import { BagDrawer } from "@/components/bag-drawer";
import { BagSync } from "@/components/bag-sync";
import { CurrencyBoot } from "@/components/currency-boot";
import { ShopConfigProvider } from "@/components/shop-config";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getShopSettings } from "@/lib/caelinex/settings";
import { getCurrencies, listCategories, listProducts } from "@/lib/commerce";
import { isExternal, resolveLink } from "@/lib/link";
import { getNavigation } from "@/lib/nav";
import "./globals.css";

const script = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});
const serif = Cormorant_Garamond({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const ui = Urbanist({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const FALLBACK_DESCRIPTION =
  "Anti tarnish boutique. Curation for the elegant women: waterproof jewellery for every day. Shipping to India, the UAE, Europe and Canada.";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, brand } = await getShopSettings();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: {
      default: seo.title || "Guvira | Anti-tarnish everyday gold",
      template: "%s | Guvira",
    },
    description: seo.description || FALLBACK_DESCRIPTION,
    ...(brand.favicon.media ? { icons: { icon: brand.favicon.media } } : {}),
  };
}

export const viewport: Viewport = { themeColor: "#fbf8f4" };

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [currencies, nav, settings, categories, products] = await Promise.all([
    getCurrencies(),
    getNavigation(),
    getShopSettings(),
    listCategories(),
    listProducts(),
  ]);
  const note = settings.announcement;
  const href = note.link ? resolveLink(note.link) : undefined;
  const pick = products.find(
    (p) => p.images[0] && !p.images[0].src.endsWith("no-photo.svg"),
  );
  const { features, productPage } = settings;
  return (
    <html
      lang="en"
      className={`${script.variable} ${ui.variable} ${serif.variable}`}
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <ShopConfigProvider
          value={{
            nav: nav.header,
            wishlist: features.wishlist,
            search: features.search,
            cashOnDelivery: features.cashOnDelivery,
            stickyAddToCart: productPage.stickyAddToCart,
            deliveryCheck: productPage.deliveryCheck,
            sizeGuide: {
              enabled: productPage.sizeGuide.enabled,
              text: productPage.sizeGuide.text,
            },
            logo: settings.brand.logo.media,
            promises: settings.promises.items,
            announcement: {
              text: note.enabled ? note.text : "",
              href,
              external: href ? isExternal(href) : false,
            },
            menu: {
              categories: categories.map((c) => ({
                slug: c.slug,
                name: c.name,
                count: c.count,
                image: c.image?.src,
              })),
              featured: pick && {
                slug: pick.slug,
                name: pick.name,
                line: pick.line,
                image: pick.images[0].src,
              },
            },
          }}
        >
          {children}
        </ShopConfigProvider>
        <CurrencyBoot currencies={currencies} />
        <BagSync />
        <BagDrawer />
        {features.whatsapp.enabled && features.whatsapp.number && (
          <WhatsAppButton
            number={features.whatsapp.number}
            message={features.whatsapp.message}
          />
        )}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
