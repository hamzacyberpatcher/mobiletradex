# MobileTradeX

A high-fidelity, frontend-only prototype of **MobileTradeX**, a peer-to-peer marketplace for verified second-hand phones. It was built for an HCI course (Phase 4: high-fidelity design) and is a set of connected screens, not a working marketplace: there is no backend and all data is hard-coded.

The idea the page is built around: on classifieds, a phone's flaws are buried in the last line of the description, and buyers find out at the meetup. MobileTradeX tests each phone's hardware, checks its IMEI and the seller's CNIC, lists condition first in a fixed format, and holds payment in escrow until the buyer has inspected the phone.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Landing page (below) |
| `/sell` | Seven-step listing flow: CNIC check, device, condition, hardware test, photos, price, review and publish |
| `/browse` | Browse phones: ranked search, filters, sort, compare, saved phones, infinite scroll |
| `/browse/[id]` | Listing detail: specs, condition with defects first, price against fair value, hardware report, seller and closed-deal reviews, escrow, offers, messages |
| `/chat` | Full chat window with sellers (canned replies, masked phone numbers, structured offers) |

A floating chat button on the browse pages opens a small chat window; its expand icon opens `/chat`. Listing details follow the order the interviews asked for: name, specs, condition, price. `DESIGN_PRINCIPLES.md` maps Shneiderman's, Norman's and Mandel's rules to where they appear in the UI.

## What's on the landing page

- **A 3D phone that tells the story.** A procedural Three.js handset starts cracked and scuffed and is repaired as you scroll (cracks heal outward, scuffs fade, a Verified shield appears). It turns to show the back, follows your cursor, and you can click it to trigger a repair pulse. The animation finishes before the Brands section covers it.
- **Problem and solution.** A mock listing with the flaw buried in the last line, and a stepper showing the fixed listing format: phone, specs, condition, price.
- **Services you can try.** A scroll-stacked set of cards, each with a small working demo (price slider, hardware test, hold-to-release escrow, meetup spots, masked chat, rating).
- **Brands.** A full-screen circular carousel of 16 phone-brand logos with live listing counts.
- **Reviews.** A rating summary that counts up, filter chips (buyers, sellers, refurbishers), and flip cards showing the evidence reviewers attached.
- **Call to action.** A slide-to-start control over a moving silk background.
- **Dark mode.** A header toggle; the choice is saved in `localStorage` and a cookie and applied before first paint, so there is no flash.
- **Header** that collapses into a floating glass bar on scroll, inertial smooth scrolling, soft edge blur, and a reduced-motion fallback throughout.

## Tech

Next.js 15 (App Router), TypeScript, Tailwind CSS 3, Three.js with React Three Fiber, Motion, and Lenis. Several interface effects come from [React Bits](https://reactbits.dev); their sources live in `src/components/reactbits/`.

## Getting started

Requires Node 18.18 or newer.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Other scripts:

```bash
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # type-check (tsc --noEmit)
```

`npm` works too if you prefer it, but the lockfile is for pnpm.

Don't run `pnpm build` while `pnpm dev` is running: they share the `.next` folder and the dev server will break. Stop it first, or delete `.next` and restart.

## Where things are

| Path | What it is |
| --- | --- |
| `src/app/` | Routes (`/`, `/sell`, `/browse`, `/browse/[id]`, `/chat`), layout, global styles and theme variables |
| `src/components/listing/` | The `/sell` flow |
| `src/components/browse/` | Browse page, filters, listing detail, dialogs, placeholder photos |
| `src/components/chat/` | Full chat page and the floating chat widget |
| `src/components/phone/` | The 3D phone: geometry, procedural textures, cursor interaction |
| `src/lib/story.ts` | Maps scroll position to the phone's pose and repair level |
| `src/components/sections/` | One file per page section |
| `src/components/reactbits/` | Copied React Bits components |
| `src/data/content.ts` | Landing copy and sample data (services, brands, reviews) |
| `src/data/listing.ts` | Models, options and copy for the sell flow |
| `src/data/listings.ts` | 36 dummy marketplace listings and 8 sellers |
| `src/data/chat.ts` | Seed conversations |
| `src/lib/` | Listing rules (grade, hardware test, fair price), browse search and filters, chat rules |
| `public/brands/` | Card images for the brand carousel |

`CLAUDE.md` has a deeper tour of how the scroll story, theming and interaction layer fit together.

## Notes on third-party material

- **Sample data.** Review text, seller names, listings, prices and ratings are made up for the prototype. Listing photos are placeholder drawings.
- **Brand logos** are trademarks of their respective owners and are used here only to illustrate a student prototype. They come from [Simple Icons](https://simpleicons.org) and Wikimedia Commons. Remove them if you reuse this project commercially.
- **React Bits** components are used under their own licence terms (MIT with the Commons Clause). Check the [React Bits licence](https://github.com/DavidHDev/react-bits) before using them in anything you sell.

## Licence

No licence has been chosen yet, so all rights are reserved by default. Add a `LICENSE` file if you want others to be able to reuse the code.
