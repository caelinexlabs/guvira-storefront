# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- **Commerce backend:** Caelinex Business OS (the owner's own platform), used headless through its API. It already supports products, prices, discounts, promotions and orders. Missing ecommerce features (customer accounts, cart and checkout flow, wishlists, reviews, shipping rates, multi-currency pricing, storefront content) are to be added to Caelinex rather than worked around in the storefront.
- **Storefront:** delegated. Recommended: Next.js with Tailwind, matching the Caelinex stack and its shared SDK pattern. Confirm before the build.

## Users

Women roughly 18–45 who want jewellery they can wear every day, to work, out, and occasionally to an occasion, without it tarnishing. They buy for themselves first and sometimes as gifts. They shop on their phones, often from Instagram, and judge a piece by how it looks on a real hand, ear or wrist.

Markets: India first, plus international buyers in the EU, UAE, Canada and similar.

## Product Purpose

Guvira sells demi-fine fashion jewellery.

**Categories:** Rings, Necklaces, Hand cuffs, Arm cuffs, Earrings, Pendants. (Written "Hand cuffs" as two words in customer-facing copy, so it never reads as "handcuffs".)

**Materials and finishes:**

- **High-quality anti-tarnish**: waterproof, everyday pieces that keep their colour.
- **Gold oxidised**
- **Silver oxidised**
- **AD (American diamond)** stones

Indian price band roughly ₹500–₹2,999. International prices are set separately per currency (USD, CAD, AED, EUR and others) at higher price points, not converted from INR.

Success: a visitor finds a piece they love, trusts it will last, and checks out on their phone without friction.

## Positioning

Tagline: **"Adorn your boldness."** Bold-looking, statement-capable design at an everyday price, made to be worn daily rather than saved for occasions.

## Operating Context

- Discovery is mostly mobile, often arriving from social media to a single product.
- The same piece is styled for both Indian wear (silk sarees with zari borders) and Western workwear (silk shirts, tailored trousers); the photography shows both.
- International buyers see their own currency and shipping terms.

## Capabilities and Constraints

- Catalog, prices, discounts, promotions and orders come from Caelinex.
- Multi-currency pricing per market is required, as is GST-ready invoicing for India.
- Finishes are anti-tarnish, gold oxidised and silver oxidised, with AD stones. The specific base metals and plating (e.g. stainless steel, brass, PVD or micro gold plating) are **not confirmed**. Do not state materials, carat, waterproof ratings or warranty terms until the owner provides them.
- Product names, prices and stock in mockups are placeholders until real catalog data exists.

## Brand Commitments

- Name **GUVIRA**, tagline **ADORN YOUR BOLDNESS**.
- Logo: a jewelled "G" with a leaf-shaped, pavé-set inner stroke and a four-point star sparkle, rendered in polished rose-gold metal with a high-contrast serif wordmark and a widely tracked sans tagline (`assets/brand/guvira-logo-mockup.webp`, a 3D mockup; a flat vector logo is still needed).
- In-house photography carries a small monochrome logo watermark in the bottom-right corner.

## Evidence on Hand

In-house product photography in `assets/products/` covers rings, a hand cuff and earrings only; necklaces, arm cuffs, pendants and the oxidised finishes have no photography yet. Photography: (1493×2000 portrait JPGs, warm neutral styling: ivory silk, linen, travertine and stone plinths, ivory velvet ring stands, soft window light):

- **Emerald heart wrap ring**: open bypass ring with a green heart stone and a clear trillion stone, baguette and round accents (6 photos).
- **Nail wrap bangle**: polished gold double-wrap bangle with a nail-head end (6 photos).
- **Crossover pavé ring**: open multi-band gold ring with two pavé-set crossing bands (6 photos).
Each set of six is shot the same way: worn with a saree, on a stone plinth, a close-up, on satin in sunlight, on a velvet stand, and worn with a silk shirt.
- **Petal filigree hoops**: layered gold filigree petal drops on hoops (1 photo, worn).

Not available yet, and not to be invented: customer reviews or ratings, customer counts, press mentions, certifications, real prices, materials, warranty and return terms.

## Product Principles

1. **Show it worn.** Every piece is judged on the body; lead with on-hand and on-ear photography, with studio shots second.
2. **Everyday luxury, not occasion-only.** The site should feel premium without implying the piece is too precious to wear.
3. **Earn trust with facts.** Care, materials and returns are stated plainly once known; never puffed up.
4. **Mobile checkout first.** Every path from discovery to payment works one-handed on a phone.
5. **One store, many markets.** Currency, pricing and shipping adapt to the buyer's country.

## Accessibility & Inclusion

- WCAG 2.2 AA contrast for all text, including over photography.
- Every product photo needs descriptive alt text (stone colour and shape, metal, how it is worn).
- Respect reduced motion; no information carried by animation alone.
