# Day 2 checklist

## JavaScript foundations

- **Slides 6-14 — Implemented:** `examples/day2/javascript-exercises.js` provides runnable operator, scope, destructuring, spread, rest-parameter, and prediction examples. The prediction/reflection conversation remains a classroom activity.
- **Slides 17-19 — Implemented:** the same module provides `map`, `filter`, copied `sort`, `find`, and `reduce` examples; automated tests verify them.

## Data, DOM, and cart

- **Slides 20-21 — Prepared for manual work:** `examples/day2/dom-and-devtools.md` contains the exact Console exercises. They require Chrome DevTools.
- **Slide 22 — Implemented:** `index.html` has an empty product grid; `src/ui.js` generates all product cards and artwork using product IDs from `src/products.js`.
- **Slide 23 — Implemented:** name/category search, category filtering, and ascending/descending price sorting are combined in `src/logic.js` and rendered by `src/ui.js`.
- **Slides 24-26 — Implemented:** `src/state.js` loads/saves the cart using JSON/localStorage and `src/ui.js` uses delegated click handlers with data attributes.
- **Slide 27 — Implemented safely:** `examples/day2/slide-27-ai-bugs.js` fixes the three named failure modes: array-to-string rendering, in-place sorting, and non-JSON localStorage values. Tests cover these fixes.
- **Slide 28 — Manual confirmation:** verify refresh persistence and a red-error-free Console in Chrome.

### Student-created exercise data

- **Slides 19, 22, 23, and 26 — Implemented with student-created data:** the instructor supplied only the PDF, so `src/products.js` now contains 12 sample products rather than an instructor starter file.
- **Automated exercise targets:** catalog total $877; `bag` returns 3 products; `Shoes` returns 4 products; descending price starts at $150; Market Tote ×2 plus Everyday Sneakers totals $253. The product data is clearly labeled student-created, not instructor-provided.

## Architecture

- **Slides 31-33 — Implemented:** `products.js`, `logic.js`, `state.js`, `ui.js`, and `main.js` follow the stated responsibilities. `data.js` is a compatibility re-export. `CLAUDE.md` and `AGENTS.MD` record the architecture rules.
- **Slides 34-37 — Partially automated:** lint and unit tests check basic quality and pure behavior. Review the code and run the manual browser regression checklist before classroom demonstration.

## Debugging and showcase

- **Slides 40-42 — Prepared:** use the DevTools and breakpoint instructions in `examples/day2/dom-and-devtools.md`.
- **Slides 43-45 — Not reproducible from this PDF alone:** the deck does not provide the six Debug Lab bugs. Do not add invented log entries; use the supplied lab code if it becomes available.
- **Slide 46 — Prepared:** follow `examples/day2/showcase-checklist.md`.
- **Slide 47 — Assignment status:** interactive storefront, modular structure, and an honest debugging log are implemented. Manual DevTools evidence remains required.
