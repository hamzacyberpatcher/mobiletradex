# Design principles in the browse and listing pages

Where each rule from the Phase 4 brief shows up in `/browse` and `/browse/[id]`. Use it as the source for the heuristic evaluation workbook.

## Shneiderman's eight golden rules

| Rule | Where it is applied |
|---|---|
| 1. Strive for consistency | Same header, footer, tokens, dialogs and buttons as the landing and `/sell`. Every listing shows name, specs, condition, price in that order (card, detail, compare table, seller preview). |
| 2. Seek universal usability | Keyboard shortcuts for frequent buyers (`/` search, `f` filters, `s` saved, `c` compare, `?` help) with a help dialog. Novices keep clear buttons and suggested searches. Screen-reader labels on every icon button, `aria-live` result count, visible focus, reduced-motion support. |
| 3. Offer informative feedback | Result count and skeleton loading on every filter change, toasts for save, offer and message, escrow progress stages, "Showing 12 of 35" bar, checklist progress. |
| 4. Design dialogs to yield closure | Escrow runs explain, pay, progress, done with a clear final screen. Offer and message dialogs end with a toast that offers "Open chat". |
| 5. Prevent errors, handle errors simply | Compare disabled until 2 phones, capped at 3 with a plain message. Offer above asking price is blocked and offers under 60% are warned about. Escrow pay button needs the agreement ticked. Inverted price range is flagged. Phone numbers typed into messages are masked. |
| 6. Permit easy reversal | Undo on clear all filters, save, remove from saved and clear viewing history. Every dialog has Cancel, close and Escape. |
| 7. Keep the user in control | Escape clears the search box. Filters are removable one by one as chips. Nothing changes the page unprompted. Filters persist when going back from a listing. |
| 7 and Mandel, in context | Floating chat window: the buyer messages a seller without leaving the phone they are viewing, and expands to the full page only when they choose. |
| 3. Feedback | Infinite scroll shows a loading skeleton row, a status line and a progress bar; it announces when everything is loaded. |
| 8. Reduce short-term memory load | Recently viewed strip, saved phones, active filter chips, compare bar, and the meetup checklist saved per listing. |

## Norman's design principles

| Principle | Where it is applied |
|---|---|
| Visibility | Defects are shown on the card and in a boxed block at the top of the condition section, never at the end of a description. Verified or Not tested badge on every listing. |
| Feedback | Skeletons, progress bars, toasts, pressed states (`aria-pressed`) on chips, heart and switches. |
| Constraints | Disabled buttons until a step is valid, payment options limited to what the seller accepts, sold phones cannot be bought. |
| Mapping | Filters sit beside the results they change. Fair-value bar places the price between low and high. Sort control is next to the result count. |
| Consistency | Same chip, switch, card and dialog shapes everywhere. |
| Affordance and signifiers | Buttons look like buttons, the photo shows "Click to enlarge" on hover, chips show a tick when on, stretched card link for the whole card. |
| Conceptual model | Escrow explainer shows the four steps before any money moves. |

## Mandel's guidelines

| Guideline | Where it is applied |
|---|---|
| Place the user in control | Undo, Escape, removable chips, no forced flows, any dialog can be closed. |
| Reduce the user's memory load | Recently viewed, saved phones, meetup checklist, persistent filters. |
| Make the interface consistent | One design system across landing, sell, browse, detail and chat. |

## Interview findings

Condition and defects first (card and detail), reviews only from closed deals with evidence photos, similarity-ranked search with highlighted matches, Verified Hardware report, escrow and cash both supported, CNIC verified badge on every seller, fixed order of description.
