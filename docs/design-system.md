# Guvira design system

The storefront's visual language in code. Figma ("Guvira — Editorial storefront") stays the source of truth; this file records how it is built, so new work reuses what exists. All tokens live at the top of `src/app/storefront.css`.

## Rules

- **Use a token, not a number.** Colours, sizes, spacing, corners, shadows, layers and durations all have tokens. A value that fits no token is either a stray (round it onto the scale) or a deliberate one-off (leave a comment saying why).
- **One section-heading style:** `<Heading script caps />`, a script lead-in over a capitals line. `center` centres it, `xl` is for the closing statement, `sm` is for headings inside cards, and `on-dark` is for dark grounds.
- **Icons have one meaning each.** The spark means shine (Premium Gold Finish, the footer tagline, the "still being polished" empty state); the grid icon is "All", the sun is "every day". Don't reuse the spark as a generic decoration.
- **Say each claim once per screen.** Waterproof, anti-tarnish and where we ship live in the promise strip; cards and tags don't repeat them.
- **One label for "go to the shop":** "Explore collection". Category links say "Shop rings", "Shop earrings" and so on.
- **Focus is always visible.** The global outline uses `--focus`. Dark grounds (`.panel`, `.foot`, `.news`, `.vhero`, the header over the film) switch it to `--focus-on-dark`.
- **Motion** uses `--ease` or `--spring` with a `--dur-*` token. It respects reduced motion. Anything that moves for more than five seconds gets a pause control (the hero film, the bestsellers rail and the footer tagline all have one).
- **Hover effects** sit inside `@media (hover: hover) and (pointer: fine)` so taps on phones don't stick.

## Tokens

### Colour
The palette comes from the logo: evergreen `#1D2C26` (also the dark panels and footer) and brushed champagne gold. The source artwork is `public/guvira_logo_visiting_card.png`; it carries a generator watermark in its corner, so don't ship it as-is.

| Token | Use |
|---|---|
| `--paper` `--card` `--sand` | Page, raised surfaces, warm bands |
| `--ink` `--soft` | Text, secondary text (5.3:1 on paper) |
| `--line` `--line-strong` | Hairlines, hover and active borders |
| `--night` `--on-dark` | Dark panels and footer, text on them |
| `--emerald` `--gold` `--gold-light` `--gold-pale` `--gold-metal` | Brand accents |
| `--on-accent` `--on-media` | Text on filled accents, text over photos and film |
| `--wish` | The filled wishlist heart |
| `--danger` `--danger-ink` `--danger-wash` | Errors |
| `--note-line` `--note-wash` `--note-ink` | Preview and informational notes |
| `--media-bg` | Behind photos and film while they load |
| `--glass` `--glass-light` `--glass-line` `--frost` `--scrim` | Over media and behind dialogs |
| `--*-rgb` channels | Translucent tints: `rgb(var(--ink-rgb) / 0.3)` |

### Type
Fonts: `--ui` (Urbanist) and `--script` (Pinyon Script, lead-ins only).

| Token | Size | Typical use |
|---|---|---|
| `--text-3xs` | 11px | Badges, counts, keyboard hints |
| `--text-2xs` | 12px | Captions, uppercase labels |
| `--text-xs` | 13px | Meta text |
| `--text-sm` | 14px | Most interface text, buttons |
| `--text-md` | 15px | Secondary body |
| `--text-base` | 16px | Body |
| `--text-lg` | 18px | Lead paragraphs, list titles |
| `--text-xl` | 20px | Card and panel titles |
| `--text-2xl` … `--text-5xl` | 26–44px | Prices, footer wordmark, script titles in sheets |
| `--text-lead` | 16–18px fluid | Hero paragraph |
| `--display-sm` … `--display-2xl` | fluid | Script and capitals headings |

Tracking: `--tracking-tighter`, `--tracking-tight`, `--tracking-wide`, `--tracking-caps` (uppercase labels), `--tracking-loose`, `--tracking-code`.

### Spacing
A 4px scale with half steps for tight UI: `--space-0-5` (2px) up to `--space-30` (120px). The name is the multiple of 4px, so `--space-6` is 24px and `--space-3-5` is 14px. Fluid spacing for sections: `--section-y`, `--section-y-sm`, `--stack-fluid`, `--gap-fluid`, `--gap-fluid-lg`, `--gap-fluid-xl`, plus the layout tokens `--m`, `--edge`, `--max` and `--canvas`.

### Radius
`--radius-2xs` 2px (progress bars) · `--radius-xs` 6px (keys, tiny chips) · `--radius-sm` 12px (thumbnails) · `--radius-md` 14px (fields, rows) · `--radius-lg` 18px (cards, photos) · `--radius-xl` 24px (panels inside the page) · `--radius-panel` (fluid, full-bleed panels) · `--radius-pill` · `--radius-round`.

### Elevation
`--shadow-sm` (selected segment) · `--shadow-md` (raised cards, sticky bars) · `--shadow-lg` (popovers, drawers, dialogs, toasts) · `--ring` and `--ring-on-dark` (focus halos on fields).

### Layers
`--z-above` 1 · `--z-badge` 2 · `--z-sticky` 30 · `--z-header` 40 · `--z-popover` 60 · `--z-overlay` 80 · `--z-dialog` 81 · `--z-toast` 90 · `--z-skip` 100. The hero's negative layers are local to its own stacking context.

### Motion
`--dur-fast` 160 · `--dur-base` 220 · `--dur-medium` 300 · `--dur-slow` 380 · `--dur-slower` 500 · `--dur-brand` 700 · `--dur-hero` 1000 · `--dur-drift` 1300 · `--dur-film` 1800 (ms). Interface motion stays at `--dur-slow` or below; the longer ones are for one-off brand moments, reveals and slow image zooms. Easing: `--ease` (strong ease-out) and `--spring`.

### Breakpoints
Media queries can't read custom properties, so these are fixed: 420px (small phones), 560px (phones), 767px (hero film switches to its phone cut), 860px (tablets and below), 960px (checkout, account and help go to one column), 1180px (narrow desktops).

## Components

| Component | Where | Variants | States |
|---|---|---|---|
| `Heading` | `components/ui.tsx` | `center`, `xl`, `sm`, `on-dark`; `as` h1–h3/p | n/a |
| `PillLink` / `PillButton` | `components/ui.tsx` | tone `light`, `dark`, `emerald` | hover, focus, pressed, `disabled`, `pending` (spinner, `aria-busy`), added (`data-state`) |
| Icon button `.icon-btn` | header, rail, drawers | glass over the film, solid elsewhere | hover (mouse only), focus, count badge |
| Product card | `components/product-card.tsx` | in grid, in rail (clones are `inert`) | hover zoom, wishlist pressed, quick-add added |
| Category tile `.tile` | home page | arch photo or line glyph | hover, focus |
| Category strip `.cat-strip` | shop page | round photo | current (gold ring), focus |
| Bestsellers rail | `components/bestsellers.tsx` | filter tabs | drifting, paused (hover, focus, touch, off-screen, pause button), static when it can't loop |
| Finish card `.finish-card` | home page | per-finish swatch | hover, focus |
| Look tile `.strip` | home page | tall and short alternate | hover, focus |
| Story steps | `components/pinned-story.tsx` | pinned on desktop, stacked on phones | current step (filled icon); every step stays readable |
| FAQ | `home-sections.tsx` `Faq` | n/a | native `<details>` open and closed |
| Newsletter | `components/newsletter.tsx` | `open` true or false | idle, pending, error (field marked, message), done (preview says nothing was sent) |
| Hero film | `components/hero-video.tsx` | desktop and phone cuts | playing, paused (button), reduced motion (still) |
| Logo `.logo` | header | lotus and GUVIRA from the visiting-card artwork (`public/brand/logo-green.png`). Green artwork in a paper pill, the same over the hero film and on every page | hover, focus |
| Promise strip `.promise-strip` | home page, after Bestsellers | three items with dividers; stacked on tablets and phones. The product page has its own, separate `.promises` list | n/a |
| Footer | `components/site-footer.tsx` | full: four columns (Shop, Customer care, Your Guvira, Connect), the hologram, the tagline and a base row. `slim` (checkout, success, failed): help links and the small print only | links hover, focus |
| Tagline ticker `.tagline` | footer, under the hologram | n/a | running, paused (hover, focus, button), still and wrapped under reduced motion |

**Why two category shapes:** the home page tiles are editorial (a large arch photo with a description) and invite browsing. The shop page strip is a compact filter whose job is to show which category is selected. They are different components on purpose, so don't merge them.

## Known content gaps

- The necklaces, arm cuffs and pendants tiles show line glyphs until real photos exist.
- The "Worn on real days" strip has one look per piece (four). Add more as new photography arrives, without repeating a piece.
