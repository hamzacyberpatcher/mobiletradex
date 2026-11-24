# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MobileTradeX: frontend-only high-fidelity prototype (HCI course, Phase 4) of a verified second-hand phone marketplace for Pakistan. No backend; all data is hard-coded. The four `.txt` files in the repo root (proposal, interview findings, phase brief, rubric) are the source of truth for content and are graded on typography, layout, color, realistic copy (no lorem ipsum), consistency, and dialogs/message boxes/progress indicators. Only the landing page exists so far.

## Commands

This machine has Node but no npm, and the cached corepack pnpm is broken. Use a pinned pnpm through corepack:

```bash
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack pnpm@9.15.0 exec next dev -p 3000     # dev server (also configured in .claude/launch.json)
corepack pnpm@9.15.0 exec tsc --noEmit         # type-check (the "lint" script; there is no ESLint or test suite)
corepack pnpm@9.15.0 exec next build           # production build
```

Pin `typescript@5` (v7 is too new for Next 15). Tailwind is v3 (`tailwind.config.ts`), not v4. Fonts come from `next/font/google`, so builds need network.

## Architecture

The page is a normal DOM scroll layout with one **fixed full-viewport r3f `<Canvas>`** behind it (`z-0`, pointer-events none). The phone's state is a pure function of scroll position. Understanding this needs several files:

- `src/lib/story.ts` is the glue. Sections that sit over the phone carry `data-story="<index>"` (0 hero, 1 problem, 2 solution, 3 services only; Brands, Reviews, CTA and footer are ordinary sections). `measureStory()` turns the viewport centre into a continuous `story.s` (section index + fraction). `poseAt(s)` and `repairAt(s)` interpolate keyframe tables (`KEYS`, `REPAIR`) for the phone's transform and its 0..1 repair level. Changing section order, adding sections, or changing section heights means re-keying these tables and the `data-story` indices.
- `PhoneStageLoader` (client, dynamic import with `ssr: false`) attaches scroll/resize listeners that call `measureStory`, and mounts `phone/PhoneStage` (canvas, lights, offline `Lightformer` environment so no HDR download).
- `phone/Phone.tsx` damps the current pose toward the target each frame and applies `repair` to everything: crack healing (`ShaderMaterial` that erases the crack texture outward from `IMPACT_UV` with a bright seam), scuff opacity, material roughness, screen brightness, and the Verified shield pop-in. It writes `story.shown`, which `ConditionHud` (a readout inside `Header`, desktop only) reads in its own rAF loop (direct DOM updates, no React re-renders).
- `phone/textures.ts` draws all textures procedurally on canvases (screen UI, cracks, scuffs) and holds the shared phone dimensions. The screen is redrawn once `document.fonts.ready` so it uses the page's real fonts.
- The phone story **ends at the end of Services**: the last key in `KEYS` is the repaired front with the shield. `Brands` is a full-viewport, opaque section marked `data-cover`; it slides over the fixed canvas, and `Phone` stops drawing once `story.coverTop <= 0` (set in `measureStory`). Keep the phone on the right and text on the left in `Story` sections.
- `components/sections/Brands.tsx` wraps `components/reactbits/CircularCarousel.tsx` (React Bits, copied from its shadcn registry `https://reactbits.dev/r/CircularCarousel-TS-TW.json`; self-contained, edit freely) in the `orbit` preset. It takes image URLs only, so each brand is a card SVG in `public/brands/<slug>.svg` (logo centred on a frost background, generated from Simple Icons and Wikimedia Commons logo SVGs; re-generate rather than hand-edit). Slugs live in `brands` in `src/data/content.ts`.
- `components/sections/Story.tsx` wraps transparent sections: text on the left 46% on desktop (phone owns the right half), bottom-aligned frosted panel on screens under `lg` (1024px), where the phone moves to the top centre and is halved in size.

Copy and data (services, brands, reviews, team members) live in `src/data/content.ts`. Palette tokens (`deep`, `steel`, `mist`, `frost`, `reed`, `ink`, `crack`) are in `tailwind.config.ts`; shared utility classes (`.btn`, `.story-panel`, `.h-section`) are in `src/app/globals.css`.

## Interaction layer

- `src/components/reactbits/` holds React Bits components copied from `https://reactbits.dev/r/<Name>-TS-TW.json` (self-contained; extra deps: `motion`, `@hugeicons/*`). Add more the same way.
- `SmoothScroll` (Lenis) drives page scroll; it still moves the real `window.scrollY`, so the phone story and header keep working. Anything that scrolls the window itself would fight it: `ScrollStack` in Services is therefore used with `useWindowScroll`, `smoothScroll={false}`, `snap={false}`.
- Services is a `ScrollStack` of cards, each with a playable demo from `sections/ServiceDemos.tsx` (same order as `services` in `data/content.ts`). The section is tall, so the phone keyframes (fractions of section height) finish mid-section; that is intended.
- `phone/interaction.ts` (cursor tilt + click-to-pulse on the phone) is experimental and self-contained: delete it and the lines in `Phone.tsx` marked "experimental" to remove it.
- Two `GradualBlur` edges are mounted in `app/page.tsx`; keep text clear of the bottom 4rem of the viewport.

## Dark mode

- Colours are CSS variables (`--c-frost`, `--c-frost-50`, `--c-ink`, `--c-deep`, `--c-deep-900`, `--c-crack` in `globals.css`, `:root` vs `.dark`), exposed as Tailwind colours with alpha support. Use those tokens and the theme follows automatically; do not hard-code hex in components.
- Colours that must NOT change between themes are fixed Tailwind tokens: `snow`/`night` (text on always-dark / always-light surfaces), `brand` (CTA blue), `mist`, `steel`, `reed`. Brands, CTA and Footer are always-dark sections, so use `text-snow`, never `text-frost`/`text-ink`, inside them.
- A script in `app/layout.tsx` sets the `dark` class on `<html>` before first paint: saved choice (localStorage `mtx-theme`), else the `mtx-theme` cookie, else the system setting. `ThemeProvider` / `ThemeToggle` (in `Header`) write both stores. The toggle swaps its icons with `dark:` classes, so there is no flicker.
- React Bits controls that take hex colour props get them from `useTheme()` (see `ThemedStepper.tsx`, `usePalette` in `sections/ServiceDemos.tsx`).
- Do not run `next build` while `next dev` is running: they share `.next` and the dev server breaks (`__webpack_modules__[moduleId] is not a function`). Stop the dev server first.
- Hero Aurora colours (`HeroBackground.tsx`) must keep contrast with the header text: deep colours in dark mode, pale in light mode. Never use light colours in dark mode or the header text vanishes.

## Reviews section

`sections/Reviews.tsx`: a `DotGrid` background, `RatingSummary` (CountUp + bars; sample figures in `ratingSummary`), filter chips by `group`, and `FlipCard`s whose front is an `EvidencePhoto` (SVG placeholder per `evidence` kind; swap for real `<img>` when real photos exist) and back is the review. Cards animate on filter with `motion` `layout`/`AnimatePresence`; the grid reserves two rows of height on desktop so the page doesn't jump when filtering. Add reviews in `data/content.ts` (`reviews`), keeping each group at an even count.
