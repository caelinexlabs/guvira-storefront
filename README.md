# Guvira storefront

The online shop for Guvira: anti-tarnish, waterproof jewellery for India, the UAE, Europe and Canada.

This is an independent repo. Product, price, category and order data come from **Caelinex Business OS** over its Storefront API; nothing in this repo changes Caelinex. Set `CAELINEX_API_URL` and `CAELINEX_STOREFRONT_KEY` (see `.env.example`). The backend's gaps are tracked in [docs/caelinex-api-needs.md](docs/caelinex-api-needs.md).

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # Biome
```

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19, React Compiler), TypeScript | Server-rendered and static pages for fast loads and SEO on product pages; same stack as Caelinex's own web apps |
| Styling | **Tailwind CSS 4** plus the hand-tuned design styles in `src/app/storefront.css` | The approved editorial design, ported as-is |
| Fonts | `next/font`: Pinyon Script (script lead-ins), Urbanist (everything else) | Self-hosted, no layout shift |
| UI primitives | **Base UI** (dialogs for the bag and menu) | Accessible focus handling without imposing a look |
| Motion | CSS transitions, **Motion** where JS animation is needed | Light, respects reduced motion |
| Toasts | **Sonner** | "Added to your bag", wishlist confirmations |
| Prices | **NumberFlow** | Digits roll when the shopper switches currency |
| State | **Zustand** (persisted) | Bag, wishlist and currency in the browser until Caelinex has a cart API |
| Images | `next/image` | Responsive sizes and modern formats from the in-house photos |
| Payments (planned) | **Razorpay** | Caelinex already integrates it; supports UPI and cards in India and international cards |
| Hosting (planned) | Vercel, or any Node host | Next.js runs on either |

## Structure

```
CLAUDE.md               working rules and which skills to use
PRODUCT.md              who the shop is for, brand and constraints
.claude/skills/         project skills (sources in SOURCES.md); .claude/agents/ code-simplifier
docs/                   caelinex-api-needs.md (backend contract), design-system.md (tokens), adr/ (decisions, start with 0001)
design/                 reference only, not shipped (map in design/README.md): editorial/ (approved HTML), mockups/ (design directions, logo boards),
                        hero-video/ (film exports and source clips), assets/ (original photos, brand artwork)
.env.example            settings the app reads
src/
  app/                    routes: / , /shop, /shop/[category], /products/[slug]
  components/             header, footer, bag drawer, product card, hero video, sections
  lib/commerce/           the storefront's own catalog types and data access
    types.ts              Product, Category, Prices, Currency
    index.ts              listProducts, getProduct, ... (reads the Caelinex Storefront API)
    price.ts              which currency a price shows in, and bag totals
    money.ts              currency labels and formatting
  lib/store/shop.ts       bag, wishlist and currency
public/products/          product photos
public/video/             hero film (WebM VP9 + MP4, desktop 1920×1080, mobile 1080×1920)
```

## What's built

| Page | Notes |
|---|---|
| Home `/` | Video hero, categories, auto-scrolling bestsellers, pinned "made to be worn" story, finishes (each opens a filtered shop), looks, questions + newsletter. Sections and copy live in `src/content/home.ts`. |
| Shop `/shop`, `/shop/[category]` | Finish filter and sort in the URL (shareable, works without JavaScript), counts, empty states |
| Product `/products/[slug]` | Zoomable photos, ring sizes, add to bag, wishlist, delivery check, details, "worn two ways", related pieces, sticky buy bar on phones, Product structured data |
| Bag | Bottom sheet, quantities, subtotal in the chosen currency |
| Checkout `/checkout` | Contact and address per country (India, UAE, Canada, EU), inline validation shared by browser and server, server re-checks the bag. Stops before payment: says online payment opens soon |
| Account `/account`, `/account/sign-in` | One-time-code sign-in through Caelinex, httpOnly session cookie. Shows a clear notice while `CAELINEX_API_URL` isn't set |
| Search `/search`, Wishlist `/wishlist` | Word-start search with plural folding; wishlist saved on the device |
| Help `/help/[topic]` | Shipping and returns, ring sizes, care, order tracking, contact. Undecided policies say so; nothing invented |
| 404, `sitemap.xml`, `robots.txt` | Private pages are kept out of search engines |

## Waiting on Caelinex

Online payment and orders, saved addresses, order history and tracking, real stock, and sign-up for first-time shoppers. Each needs an endpoint listed in `docs/caelinex-api-needs.md`; the storefront side is built to plug into them.

## Content still to confirm

Real product names and prices, returns policy, delivery times and costs, the European countries you ship to, a ring size chart, contact email and social profiles (set in the Caelinex admin; a link hides until set), a link for the "Built by Caelinex Labs" credit, and a final browser-tab icon (`src/app/icon.svg` is a placeholder serif G).
