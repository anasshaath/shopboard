# Debugging log

## Bug 1: Product cards were static HTML

- **What I saw:** Product names, prices, descriptions, and controls were repeated in `index.html` instead of rendering from the catalog.
- **Type:** logic.
- **How I found it:** Compared the source with the Day 2 requirement that cards render from product data.
- **Cause:** The former `index.html` product-grid block (lines 134-223 before the refactor) contained the card markup, so the renderer had no independent product source.
- **Fix:** `src/ui.js` now creates artwork and product cards from the canonical `src/products.js` records.
- **Did I use AI? For what?** Yes. Codex helped identify the rendering boundary and implement the data-driven renderer.

## Bug 2: Product sorting could not restore the full default view

- **What I saw:** Price sorting was present, but the default control did not explicitly clear search and category state.
- **Type:** state.
- **How I found it:** Reviewed the homework prompt about returning to the original order after sorting.
- **Cause:** The former `src/main.js` default-control branch (line 23 before the reset fix) reset only the price/filter flags.
- **Fix:** The default control now resets search, category, Under $30, and sort direction; `src/logic.js` returns the canonical order when no sort direction is set.
- **Did I use AI? For what?** Yes. Codex compared the control state with the homework requirement and added a regression test.

## Bug 3: The cart had no Clear Cart action

- **What I saw:** Cart items could be changed or removed individually, but there was no way to empty the whole cart.
- **Type:** logic.
- **How I found it:** Checked the cart controls against the homework Part 1 checklist.
- **Cause:** `src/state.js` exposed `clearCart` at line 43, but the former cart footer in `index.html` (lines 42-46) had no control that called it.
- **Fix:** Added an accessible Clear Cart button in `index.html`, wired through `src/ui.js` and `src/main.js`, and tested that it persists an empty cart.
- **Did I use AI? For what?** Yes. Codex traced the unused state function, connected the UI action, and wrote the state regression test.

## Verification boundary

- **Automated:** `npm.cmd test`, `npm.cmd run build`, and `npm run lint` were run after the implementation changes.
- **Manual work still required:** Browser refresh persistence, Console checks, DevTools breakpoint work, keyboard-only interaction, responsive layout, and Lighthouse checks were not performed automatically.
- **Unavailable:** The six Debug Lab bug implementations were not supplied, so no Debug Lab results were invented.
- **Blocked tooling:** Husky and lint-staged are not installed locally; installation was attempted but did not complete, so no nonfunctional hook configuration was added.
