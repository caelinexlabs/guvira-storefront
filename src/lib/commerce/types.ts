// The storefront's own view of the catalog. Every page reads these types,
// never Caelinex's raw shape, so the data source can change without touching
// the UI. They are filled by ./index.ts from the Caelinex Storefront API.

export const CURRENCIES = ["INR", "USD", "CAD", "AED", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Amounts by currency. Only the currencies the shop has priced are present. */
export type Prices = Partial<Record<Currency, number>>;

export type ProductImage = {
  src: string;
  alt: string;
  /** CSS object-position, for photos framed off-centre. */
  position?: string;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  image?: ProductImage;
  /** Products in this category and everything under it. */
  count: number;
  /** Drawn glyph shown on the home tile while the category has no photo. */
  glyph?: "necklace" | "armcuff" | "pendant";
};

export const SORTS = ["relevance", "price-asc", "price-desc"] as const;
export type Sort = (typeof SORTS)[number];

/** What the shop page can be asked for. Parsed once from the URL. */
export type ShopQuery = {
  category?: string;
  sort: Sort;
  /** Chosen filter values by attribute code, e.g. { colour: ["pink", "teal"] }. */
  attrs: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

/** One filter the shop offers (Finish, Colour...), with the choices and how many pieces each has. */
export type Facet = {
  code: string;
  name: string;
  type: string;
  values: {
    slug: string;
    label: string;
    swatch?: string;
    count: number;
    selected: boolean;
  }[];
};

export type PriceRange = { min: number; max: number; currency: Currency };

export type Product = {
  /** The id a cart line is added by. */
  id: string;
  slug: string;
  name: string;
  /** Slug and name of the product's own category. */
  category: string;
  categoryName: string;
  /** Small line under the name on cards. */
  line: string;
  flag?: string;
  summary: string;
  description: string;
  details: string[];
  prices: Prices;
  /** False while the shop has no price for it: shown, but not for sale. */
  priced: boolean;
  /** Ring sizes etc., once the shop sets up variants. */
  sizes?: string[];
  images: ProductImage[];
};
