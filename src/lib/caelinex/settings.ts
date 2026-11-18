import "server-only";
import { storefront } from "./storefront";

// The shop's storefront settings (Settings -> Storefront in the Caelinex
// admin). The storefront renders what the owner sets and hides a block where
// there is nothing to show. Every value here arrives already cleaned by
// Caelinex (defaults filled, text trimmed, links checked).

export type NavLink = { label: string; url: string };

export type ShopSettings = {
  announcement: { enabled: boolean; text: string; link: string };
  navigation: {
    header: NavLink[];
    footer: { title: string; links: NavLink[] }[];
  };
  hero: {
    /** One photo or video, as an absolute address, or null. */
    media: string | null;
    /** Still shown while the video loads. */
    poster: string | null;
    /** A video (or photo) for phones, and its poster. */
    mobileMedia: string | null;
    mobilePoster: string | null;
    heading: string;
    subheading: string;
    buttonLabel: string;
    buttonLink: string;
  };
  sections: {
    categoryStrip: { enabled: boolean };
    bestSellers: { enabled: boolean; autoScroll: boolean };
    storyBanner: {
      enabled: boolean;
      media: string | null;
      heading: string;
      text: string;
    };
    gallery: {
      enabled: boolean;
      loop: boolean;
      heading: string;
      media: string[];
    };
    trustStrip: { enabled: boolean; items: string[] };
    newsletter: { enabled: boolean; heading: string; text: string };
    faq: { enabled: boolean; items: { question: string; answer: string }[] };
  };
  productPage: {
    stickyAddToCart: boolean;
    deliveryCheck: boolean;
    sizeGuide: { enabled: boolean; text: string; media: string | null };
  };
  features: {
    wishlist: boolean;
    cashOnDelivery: boolean;
    currencySwitcher: boolean;
    search: boolean;
    whatsapp: { enabled: boolean; number: string; message: string };
  };
  seo: { title: string; description: string };
  brand: { logo: { media: string }; favicon: { media: string } };
  contact: {
    email: string;
    phone: string;
    address: string;
    social: {
      instagram: string;
      facebook: string;
      pinterest: string;
      youtube: string;
      x: string;
    };
  };
  promises: { items: { icon: string; title: string; text: string }[] };
  /** Whether the shop emails shoppers once about a bag they left behind. */
  cartReminders: { enabled: boolean };
};

/** What the shop shows when Caelinex can't be reached: nothing optional. */
const OFF: ShopSettings = {
  announcement: { enabled: false, text: "", link: "" },
  navigation: { header: [], footer: [] },
  hero: {
    media: null,
    poster: null,
    mobileMedia: null,
    mobilePoster: null,
    heading: "",
    subheading: "",
    buttonLabel: "",
    buttonLink: "",
  },
  sections: {
    categoryStrip: { enabled: true },
    bestSellers: { enabled: true, autoScroll: true },
    storyBanner: { enabled: false, media: null, heading: "", text: "" },
    gallery: { enabled: false, loop: true, heading: "", media: [] },
    trustStrip: { enabled: false, items: [] },
    newsletter: { enabled: false, heading: "", text: "" },
    faq: { enabled: false, items: [] },
  },
  productPage: {
    stickyAddToCart: true,
    deliveryCheck: false,
    sizeGuide: { enabled: false, text: "", media: null },
  },
  features: {
    wishlist: false,
    cashOnDelivery: false,
    currencySwitcher: true,
    search: true,
    whatsapp: { enabled: false, number: "", message: "" },
  },
  seo: { title: "", description: "" },
  brand: { logo: { media: "" }, favicon: { media: "" } },
  contact: {
    email: "",
    phone: "",
    address: "",
    social: { instagram: "", facebook: "", pinterest: "", youtube: "", x: "" },
  },
  promises: { items: [] },
  cartReminders: { enabled: false },
};

type Raw = { settings?: Partial<ShopSettings> };

/** Media arrives as a plain address or as { url, type }; the page wants the address. */
const mediaUrl = (v: unknown): string | null => {
  if (typeof v === "string") return v || null;
  if (v && typeof v === "object" && "url" in v) {
    const u = (v as { url: unknown }).url;
    return typeof u === "string" && u ? u : null;
  }
  return null;
};

/** Settings, cached for a minute. */
export async function getShopSettings(): Promise<ShopSettings> {
  const r = await storefront<Raw>("", {}, { revalidate: 60 });
  if (!r.ok) return OFF;
  const s = r.value.settings ?? {};
  // Merge over the "off" shape so a missing key never breaks a page.
  const merge = <T extends object>(base: T, over: unknown): T =>
    ({ ...base, ...(typeof over === "object" && over ? over : {}) }) as T;
  const hero = merge(OFF.hero, s.hero);
  const story = merge(OFF.sections.storyBanner, s.sections?.storyBanner);
  const gallery = merge(OFF.sections.gallery, s.sections?.gallery);
  const sizeGuide = merge(OFF.productPage.sizeGuide, s.productPage?.sizeGuide);
  const logo = merge(OFF.brand.logo, s.brand?.logo);
  const favicon = merge(OFF.brand.favicon, s.brand?.favicon);
  return {
    announcement: merge(OFF.announcement, s.announcement),
    navigation: merge(OFF.navigation, s.navigation),
    hero: {
      ...hero,
      media: mediaUrl(hero.media),
      poster: mediaUrl(hero.poster),
      mobileMedia: mediaUrl(hero.mobileMedia),
      mobilePoster: mediaUrl(hero.mobilePoster),
    },
    sections: {
      categoryStrip: merge(
        OFF.sections.categoryStrip,
        s.sections?.categoryStrip,
      ),
      bestSellers: merge(OFF.sections.bestSellers, s.sections?.bestSellers),
      storyBanner: { ...story, media: mediaUrl(story.media) },
      gallery: {
        ...gallery,
        media: (Array.isArray(gallery.media) ? gallery.media : [])
          .map(mediaUrl)
          .filter((m): m is string => !!m),
      },
      trustStrip: merge(OFF.sections.trustStrip, s.sections?.trustStrip),
      newsletter: merge(OFF.sections.newsletter, s.sections?.newsletter),
      faq: merge(OFF.sections.faq, s.sections?.faq),
    },
    productPage: {
      ...merge(OFF.productPage, s.productPage),
      sizeGuide: { ...sizeGuide, media: mediaUrl(sizeGuide.media) },
    },
    features: {
      ...merge(OFF.features, s.features),
      whatsapp: merge(OFF.features.whatsapp, s.features?.whatsapp),
    },
    seo: merge(OFF.seo, s.seo),
    brand: {
      logo: { media: mediaUrl(logo.media) ?? "" },
      favicon: { media: mediaUrl(favicon.media) ?? "" },
    },
    contact: {
      ...merge(OFF.contact, s.contact),
      social: merge(OFF.contact.social, s.contact?.social),
    },
    promises: merge(OFF.promises, s.promises),
    cartReminders: merge(OFF.cartReminders, s.cartReminders),
  };
}
