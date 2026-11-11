# ADR-0001: Repository structure

**Status:** Accepted
**Date:** 2026-11-08
**Deciders:** Guvira owner

## Context

The repo is a single Next.js app (App Router) with no commits yet. Design
references, original photos, hero film sources and mockups used to live in a
separate `Guvira/design` folder outside the repo. `CLAUDE.md` pointed to it
with a `../` path, so a fresh clone could not find the approved reference.
The root also held three unused brand images inside `public/`, which Next.js
serves to the world.

## Decision

Keep the Next.js layout as it is, and bring everything the project depends on
inside the repo with one rule per top-level folder.

| Path | Holds | Shipped |
|---|---|---|
| `src/app/` | Routes, layout, global styles | Yes |
| `src/components/` | One component family per file | Yes |
| `src/content/` | Page copy as data (home, help, site details) | Yes |
| `src/lib/` | Data access, types, state, checkout logic | Yes |
| `public/` | Only files the site serves: `brand/`, `products/`, `video/` | Yes |
| `docs/` | Backend contract, design-system tokens, decisions (`docs/adr/`) | No |
| `design/` | Reference only: approved editorial HTML, mockups, logo boards, original photos, hero film sources, brand artwork | No |
| `.claude/` | Project skills and agents | No |
| Root | Tooling config the tools expect there (`package.json`, `tsconfig.json`, `biome.json`, `next.config.ts`, `postcss.config.mjs`), plus `README.md`, `CLAUDE.md`, `PRODUCT.md`, `.env.example` | No |

Rules that follow from this:
- Nothing in `design/` is imported by `src/` or linked from the site. Biome
  skips it.
- `public/` holds only optimised files the pages reference.
- Originals and sources go in `design/assets/`, never in `public/`.
- Generated output (`.next`, `node_modules`, `*.tsbuildinfo`) stays out of git.

## Options considered

### Option A: Keep `design/` outside the repo
| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | None |
| Team familiarity | Current state |

**Pros:** repo stays small.
**Cons:** a fresh clone loses the reference `CLAUDE.md` names, and the
originals have no history.

### Option B: `design/` inside the repo (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | About 45 MB in the first commit |
| Team familiarity | Same as any docs folder |

**Pros:** one clone has everything; paths in docs resolve; originals are versioned.
**Cons:** larger repo, mostly binary files.

### Option C: Move to a monorepo with `apps/` and `packages/`
**Pros:** room for the landing page and coming-soon site to share code.
**Cons:** restructures a working app with no second consumer yet, and breaks
every path in docs and config. Not justified today.

## Trade-off analysis

Option B costs disk space and buys a self-contained repo. The size comes from
about 20 MB of photos and 11 MB of source video, which do not change often.
Option C is the ecosystem-heavy choice and can wait until a second app needs
shared code.

## Consequences

- A newcomer finds the design reference, docs and code by folder name.
- `pnpm lint` stays fast because `design/` is ignored.
- The first commit is larger. If it becomes a problem, move
  `design/hero-video/source` and `design/assets/originals` to Git LFS or
  external storage and keep a note in `design/README.md`.
- `src/components/` is flat at 18 files. Split by area (`home/`, `shop/`,
  `checkout/`) when it passes about 25 files or a family of three or more
  related components appears.

## Action items

1. [x] Move `Guvira/design` into `design/` and delete duplicates of `public/`.
2. [x] Move unused brand images out of `public/` into `design/assets/brand/`.
3. [x] Exclude `design/` from Biome.
4. [x] Point `CLAUDE.md` and the READMEs at the new paths.
5. [ ] Decide whether the 45 MB of design binaries go to Git LFS before the first push.
6. [ ] Revisit the monorepo question when `guvira-landing` needs shared components.
