# ShopBoard

## Stack and coding rules

- Vite with vanilla JavaScript, HTML, and CSS.
- Use semantic HTML, labels for every form input, and mobile-first styles.
- Avoid `!important`.
- Explain planned code changes before editing.

## Architecture

- `src/products.js`: Canonical product data only; no DOM nodes or mutable UI state.
- `src/data.js`: Compatibility re-export for earlier Day 2 examples; do not add product data here.
- `src/state.js`: Cart/view state and localStorage persistence.
- `src/logic.js`: Pure catalog, cart-total, validation, and order-ID functions.
- `src/ui.js`: The only module that queries or changes the DOM; it owns rendering and DOM event listeners.
- `src/main.js`: Application composition only. It connects UI actions to logic/state and must not access `document`, `window`, or `localStorage`.

## Guardrails

- Keep product information in `products.js` as the single source of truth.
- Keep browser-independent business rules in `logic.js`.
- Change cart data through `state.js`; a localStorage failure must retain the current in-memory cart.
- Preserve accessible labels, live regions, keyboard interactions, and focus handling when changing UI.
- Sort copies of product data only; Default must restore original catalog order.
- Attach product interactions through delegated grid listeners so filtering never duplicates handlers.
- Persist only cart IDs and quantities, deriving product details and totals from `products.js`.
