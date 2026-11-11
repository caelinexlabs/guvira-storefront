# What Guvira needs from Caelinex Business OS

Goal: the shop owner runs Guvira entirely from the Caelinex admin. The storefront holds no product data, copy or settings of its own. This file is the contract the storefront asks Caelinex to meet. It replaces the earlier guess at `/storefront/:slug/...`.

Checked against `docs/retail/storefront-api.md` in the caelinex-business-os repo (2026-11-08). The real API is `/v1/storefront/*`, picked by an `X-Storefront-Key` header, wrapped as `{ success, data }`.

Priority: **P0** blocks launch, **P1** needed within the first month, **P2** later.

## 1. What the owner must control from the admin

### Catalog
| Item | Today | Priority |
|---|---|---|
| Categories with name, blurb, photo, banner, order, visibility | Built | P0 |
| Products: name, slug, summary, description, detail bullets | Built (confirm `summary` and bullets) | P0 |
| Per-product **finish** (anti-tarnish gold, gold oxidised, silver oxidised) and **AD stones** flag, filterable with counts | Not confirmed; needs filterable product attributes | P0 |
| Per-product badge text ("New", "AD stones") | Not confirmed | P1 |
| Variants: ring size with own SKU, stock and price | Built | P0 |
| Images in order with alt text, optional tie to a variant | Built | P0 |
| Prices set by hand per currency (INR, USD, CAD, AED, EUR), compare-at price | Built | P0 |
| Collections | Built | P1 |
| Finish definitions (name, swatch colour, one-line blurb) managed as data, not code | Not built | P1 |
| Related, upsell and styled-with pairings per product | Built | P1 |
| Bulk import of products and photos | Admin import exists; confirm photo import | P1 |

### Site content (Settings → Storefront)
| Item | Today | Priority |
|---|---|---|
| Shop name, tagline, contact email, phone, social links, WhatsApp link | Partly | P0 |
| Countries the shop ships to and the currency per market | Channel currencies only | P0 |
| Home page as ordered sections: hero (desktop and mobile video, poster, headline, button), categories, bestsellers, promises, story steps with photos, "looks" tied to products, FAQ, closing banner | Hero and sections exist; confirm each field | P0 |
| Help pages (shipping and returns, ring sizes, care, order tracking, contact) as editable rich text | Not built | P0 |
| Navigation and footer links | Not built | P1 |
| SEO titles, descriptions and share images per page type | Built (seo) | P1 |
| Announcement bar | Not built | P2 |
| Draft and publish with a preview key so changes can be checked before they go live | Not built | P1 |
| Media library with alt text, image sizes and video posters served from a CDN | Partly | P0 |

## 2. Functions the API must offer

| Function | Today | Priority |
|---|---|---|
| Public catalog, search, redirects | Built | P0 |
| Cart: create, set quantity, read with stock issues | Built | P0 |
| Guest checkout, COD and Razorpay, idempotent | Built | P0 |
| **Shipping rates** by country and region, free-shipping threshold, delivery estimate, **pincode serviceability check** | Not built (shipping is always 0) | P0 |
| **Promo codes and automatic discounts** applied to a cart, with a validation endpoint that returns the price breakdown | Not built | P0 |
| Tax: GST inclusive or exclusive per market, HSN code, invoice numbers; VAT or duties abroad | GST built; invoicing and abroad not confirmed | P0 |
| **Customer sign-in** for the retail shop by one-time code to email or mobile | Not built (portal login is for other industries) | P1 |
| **My orders** with status and **tracking** link and timeline | Not built; no tracking field on storefront orders | P0 |
| **Guest order lookup** by order number plus email or phone | Not built (token only) | P0 |
| Saved addresses | Not built | P1 |
| **Wishlist** stored against the customer, merged from the device on sign-in | Not built | P1 |
| **Newsletter, new-drop and back-in-stock sign-up**, idempotent | Not built | P1 |
| Order emails and WhatsApp: confirmation, shipped with tracking, delivered | Not confirmed | P0 |
| Carrier integration (Delhivery, Blue Dart): label, tracking updates into the order | Roadmap | P1 |
| Returns, exchanges and refunds | Roadmap | P1 |
| Stripe for international cards alongside Razorpay | Not built | P1 |
| Abandoned-cart reminder | Not built | P2 |
| Reviews with verified-buyer flag (no placeholder reviews ever) | Not built | P2 |

## 3. Architectural decisions to settle

Each needs an ADR in the Caelinex repo. The storefront's assumption is stated so Caelinex can confirm or change it.

1. **Key model.** One storefront key per site, held only by the Next.js server, never sent to the browser. Separate test and live keys, plus a preview key that sees drafts. Browser calls are not used.
2. **Retail customer identity.** A separate retail customer session (one-time code, short-lived signed token, httpOnly cookie set by the storefront), distinct from the portal login. A guest who later signs in keeps past orders matched by email.
3. **Cart ownership.** Server-side cart identified by a token cookie. On sign-in the cart attaches to the customer. Carts expire after 30 days.
4. **Pricing.** Hand-set price per currency per variant, never converted, with compare-at. A price list per market is acceptable.
5. **Product attributes.** Generic filterable attributes (finish, stones, badge) with facet counts in the product list response, instead of hard-coded fields.
6. **Content model.** Storefront settings are typed, versioned and published, not free-form JSON. The schema lives in the shared contracts package so both repos get the same types.
7. **Shipping.** Zones by country and region, rate tables, free-shipping thresholds, pincode serviceability, estimated delivery dates. Carriers sit behind one adapter interface.
8. **Tax and invoicing.** Inclusive or exclusive per market, HSN codes, gap-free invoice numbers, GST invoice PDF available to the customer.
9. **Promotions.** Codes and automatic discounts, stacking rules, usage limits, minimum spend. A cart answer lists each discount applied.
10. **Inventory.** Variant-level stock with a hold during checkout (built), release after 24 hours, low-stock flag, back-in-stock subscriptions.
11. **Order lifecycle.** Order, payment and fulfilment statuses (built), plus a tracking timeline, cancellations, returns and refunds, and customer notifications on each change.
12. **API contract.** Versioned, DTOs published as a typed SDK, consistent error codes, idempotency on every write, pagination, and ETags.
13. **Cache invalidation.** Caelinex calls a signed webhook on the storefront when a product, category or setting changes, so pages refresh at once instead of on a timer.
14. **Multi-market.** Per-market currencies, shippable countries, payment methods and tax, all set in the sales channel.
15. **Media.** Upload once; the API serves sized variants (for example 640, 900, 1600 wide) with alt text, and video with desktop and mobile files and a poster. URLs are absolute and CDN-backed.
16. **Seeding and environments.** A Guvira seed script (org, channel, categories, finishes, products, settings) and a demo reset, so any environment can be rebuilt. No placeholder data in production.
17. **Security and limits.** Origins per key (not used for server calls), rate limits, webhook signature checks, and no personal data in logs.
18. **Observability.** Order and webhook event log in the admin so the owner can see why an order is unpaid or untracked.

## 4. How the storefront will plug in

All reads go through `src/lib/commerce/` and all writes through `src/lib/caelinex/`, both server-only. Responses are mapped to the storefront's own types at that boundary. Where Caelinex lacks a function, the matching page or control is hidden rather than simulated.
