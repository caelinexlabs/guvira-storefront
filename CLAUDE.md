# Guvira storefront: working rules

Read `README.md` for what this is and how to run it, `PRODUCT.md` for who it's for, `docs/caelinex-api-needs.md` for the backend contract, and `docs/design-system.md` for the tokens and components to reuse.

## Hard boundaries

- **Independent repo.** Data comes from Caelinex Business OS over its HTTP API only. Never edit the Caelinex repo from here.
- **One data door.** Pages and components read catalog data only through `src/lib/commerce/index.ts` and the types in `src/lib/commerce/types.ts`. Map backend shapes to these types at that boundary; never pass raw API responses into components.
- **Design source of truth is Figma** (file "Guvira — Editorial storefront"). Code follows Figma; if they disagree, raise it rather than inventing a third version. `design/editorial/` is the approved HTML reference for the current pages.
- **No invented claims.** No fake reviews, ratings, stock counts, delivery promises or materials. Placeholder content is labelled as such.

## Skills to use (in `.claude/skills/`)

| When | Use |
|---|---|
| Any non-trivial change: types, refactors, debugging, migrations, "is it done?" | `principles` (routes to the `principle-*` leaves; read the chosen leaves in full) |
| Adding folders, configs, docs, or moving files | `repository-structure` |
| Building or restyling UI | `frontend-design` |
| Before calling UI work done | `web-design-guidelines` on the changed files (accessibility, forms, motion, typography) |
| After a feature lands | the `code-simplifier` agent on the changed files, behaviour unchanged |

The leaves the router names live at `.claude/skills/principle-<name>/SKILL.md` in this repo.

## Conventions

- Next.js App Router, React Server Components by default. Add `"use client"` only for state, effects, or browser APIs, and keep client components small.
- Data that must cross from server to client modules (lists, constants) lives in plain modules under `src/lib/`, never in a `"use client"` file.
- Components: `export function Name()` declarations with an inline props type; one component family per file in `src/components/`.
- Styling: tokens and component styles in `src/app/storefront.css` (ported from the approved design); Tailwind utilities for one-off layout. Don't introduce another styling system. Use the tokens in `docs/design-system.md`; never type a raw colour, size, spacing, radius, shadow or duration.
- Prices always render through `<Price>` so currency switching stays consistent. Format money with `formatMoney`, never by hand.
- Motion must respect `prefers-reduced-motion`; anything that moves for more than five seconds gets a pause control.
- Imports use the `@/` alias. Biome formats and lints: run `pnpm lint` before finishing.

## Definition of done

`pnpm lint`, `npx tsc --noEmit` and `pnpm build` pass, the change is checked in the browser at desktop and phone widths with no console errors, and `web-design-guidelines` has been run on changed UI files.
