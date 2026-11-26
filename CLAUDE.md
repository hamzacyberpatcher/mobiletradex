# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MobileTradeX: frontend-only high-fidelity prototype (HCI course, Phase 4) of a verified second-hand phone marketplace for Pakistan. No backend; all data is hard-coded. The four `.txt` files in the repo root (proposal, interview findings, phase brief, rubric) are the source of truth for content and are graded on typography, layout, color, realistic copy (no lorem ipsum), consistency, and dialogs/message boxes/progress indicators. The landing page and the `/sell` listing flow exist so far.

## Commands

This machine has Node but no npm, and the cached corepack pnpm is broken. Use a pinned pnpm through corepack:

```bash
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack pnpm@9.15.0 exec next dev -p 3000     # dev server (also configured in .claude/launch.json)
corepack pnpm@9.15.0 exec tsc --noEmit         # type-check (the "lint" script; there is no ESLint or test suite)
corepack pnpm@9.15.0 exec next build           # production build
```

Git: no user identity is configured on this machine. Existing commits use `MobileTradeX <noreply@users.noreply.github.com>`; pass it per commit with `git -c user.name=... -c user.email=...` rather than editing git config. The remote is `origin` (GitHub, `main`). If port 3000 is already taken by another dev server, point the browser at it instead of starting a second one.

Pin `typescript@5` (v7 is too new for Next 15). Tailwind is v3 (`tailwind.config.ts`), not v4. Fonts come from `next/font/google`, so builds need network.

## Architecture

The page is a normal DOM scroll layout with one **fixed full-viewport r3f `<Canvas>`** behind it (`z-0`, pointer-events none). The phone's state is a pure function of scroll position. Understanding this needs several files:

- `src/lib/story.ts` is the glue. Sections that sit over the phone carry `data-story="<index>"` (0 hero, 1 problem, 2 solution, 3 services only; Brands, Reviews, CTA and footer are ordinary sections). `measureStory()` turns the viewport centre into a continuous `story.s` (section index + fraction). `poseAt(s)` and `repairAt(s)` interpolate keyframe tables (`KEYS`, `REPAIR`) for the phone's transform and its 0..1 repair level. Changing section order, adding sections, or changing section heights means re-keying these tables and the `data-story` indices.
- `PhoneStageLoader` (client, dynamic import with `ssr: false`) attaches scroll/resize listeners that call `measureStory`, and mounts `phone/PhoneStage` (canvas, lights, offline `Lightformer` environment so no HDR download).
- `phone/Phone.tsx` damps the current pose toward the target each frame and applies `repair` to everything: crack healing (`ShaderMaterial` that erases the crack texture outward from `IMPACT_UV` with a bright seam), scuff opacity, material roughness, screen brightness, and the Verified shield pop-in. It writes `story.shown`, which `ConditionHud` (a readout inside `Header`, desktop only) reads in its own rAF loop (direct DOM updates, no React re-renders).
- `phone/textures.ts` draws all textures procedurally on canvases (screen UI, cracks, scuffs) and holds the shared phone dimensions. The screen is redrawn once `document.fonts.ready` so it uses the page's real fonts.
- The phone story **ends at the end of Services**: the last key in `KEYS` is the repaired front with the shield. `Brands` is a full-viewport, opaque section marked `data-cover`; it slides over the fixed canvas, and `Phone` stops drawing once `story.coverTop <= 0` (set in `measureStory`). Keep the phone on the right and text on the left in `Story` sections.
- `components/sections/Brands.tsx` wraps `components/reactbits/CircularCarousel.tsx` (React Bits, copied from its shadcn registry `https://reactbits.dev/r/CircularCarousel-TS-TW.json`; self-contained, edit freely) in the `orbit` preset. It takes image URLs only, so each brand is a card SVG in `public/brands/<slug>.svg` (logo centred on a frost background, generated from Simple Icons and Wikimedia Commons logo SVGs; re-generate rather than hand-edit). Slugs live in `brands` in `src/data/content.ts`.
- `components/sections/Story.tsx` wraps transparent sections: text on the left 56% on desktop (phone owns the right half), bottom-aligned frosted panel on screens under `lg` (1024px), where the phone moves to the top centre and is halved in size.

Copy and data (services, brands, reviews, team members) live in `src/data/content.ts`. Palette tokens (`deep`, `steel`, `mist`, `frost`, `reed`, `ink`, `crack`) are in `tailwind.config.ts`; shared utility classes (`.btn`, `.story-panel`, `.h-section`) are in `src/app/globals.css`.

Routes: `/` is the landing page above. `/sell` is a separate route with no canvas, no Lenis and no story keyframes, so changes to `story.ts` or the landing sections never affect it. `Header.tsx` exports `Mark` (the logo glyph), which `/sell` reuses.

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

## Usability principles layer (Phase 4 rubric: dialogs, message boxes, progress indicators)

- `ToastProvider` / `useToast()` (mounted in `app/layout.tsx`): message boxes in an aria-live region, auto-dismiss that pauses on hover/focus, optional action button. Theme toggle uses it with **Undo** (Shneiderman 3 feedback + 6 easy reversal; Nielsen 1 and 3).
- `Dialog.tsx`: modal with focus trap, Escape/close/backdrop exits, focus returns to the trigger (Norman: constraints and feedback; Nielsen 3). Uses `data-lenis-prevent` and locks `<html>` overflow so Lenis does not scroll behind it.
- The old `SellFlow` dialog is gone: every sell entry point (header "Sell a phone", hero "List your phone", footer link, CTA slider `onDone`) goes to `/sell` (see Listing flow below).
- Header scroll-progress bar (`role="progressbar"`, updated in the existing scroll handler, visible once the header turns into the glass bar): visibility of system status.
- Still to do for the rubric: the buyer-side screens (browse, listing detail, offers, escrow, chat, account) and the heuristic workbook.

## Listing flow (`/sell`)

A normal route with its own sticky header (logo, draft-saved status, `ThemeToggle`, Save & exit); no 3D canvas. `app/sell/page.tsx` renders `components/listing/ListingFlow.tsx`, which owns all state (`Draft` in `lib/listing.ts`), step navigation and the dialogs.

- Seven steps, in order: Identity (CNIC/mobile, simulated NADRA check + OTP; prototype rules: CNIC starting `11111` fails, OTP is `123456`), Device (brand logos from `public/brands`, model, specs, PTA, IMEI with Luhn check), Condition (screen, body, repairs, battery, faults; grade derived in `gradeOf`), Hardware test (simulated from the entered condition, progress + Cancel/Resume toast), Photos (local object URLs only, not saved with the draft), Price (`suggestPrice`: base price in `data/listing.ts` x factors, range bar, feedback, payment, city/meetup), Review and publish (Edit per section, terms, publish dialog -> success).
- Data lives in `data/listing.ts` (models with base prices, option lists, `STEPS` copy); validation per step in `validate()`; errors only show after pressing Continue (`showErrors`), then focus jumps to the first `[aria-invalid="true"]`. Keep that attribute on new invalid fields.
- `ListingPreview` is the right-hand (desktop) / collapsible (mobile) live card in the fixed order name, specs, condition (defects first), price, from the interview findings. Keep that order.
- Draft autosaves to localStorage `mtx-listing-draft`; reloading offers Continue draft / Start over. Save & exit and Discard (with Undo toast) are dialogs; publishing is confirm -> progress -> success screen.
- Shared form parts are in `listing/ui.tsx` (`Field`, `ChipGroup`, `Callout`, `ProgressBar`, `StageList`); use them for any new step so fields look identical. Tokens only, no hex.
- Testing tips: the step inputs are React-controlled, so when scripting them from the browser console set the value through the native `HTMLInputElement.prototype.value` setter and dispatch an `input` event. Valid sample IMEI: `356938035643809`. Clear `mtx-listing-draft` from localStorage between runs, or the Continue draft dialog appears.
- Entry points to `/sell`: `Header` and `Hero` and `Footer` use `next/link`; `Cta` calls `router.push("/sell")` after the slider finishes. Keep any new "sell" button pointing at the same route.
