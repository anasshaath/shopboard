# ShopBoard

## Stack
Vite (Vanilla JavaScript), HTML, CSS

## Rules
1. Use semantic HTML elements.
2. Add labels to all form inputs.
3. Design for mobile screens first.
4. Avoid using !important in CSS.
5. Explain every code change before making it.

## Project Structure
- index.html: Main HTML page.
- src/products.js: Canonical product data only; do not put DOM nodes or mutable UI state here.
- src/data.js: Compatibility re-export for earlier Day 2 examples; do not add product data here.
- src/state.js: Mutable cart/view state and localStorage persistence only.
- src/logic.js: Pure catalog, cart-total, validation, and order-ID functions.
- src/ui.js: The only module allowed to query or change the DOM, including event listeners and rendering.
- src/main.js: Application composition only; it connects UI events to logic and state, and must not access `document`, `window`, or `localStorage`.
- src/style.css: Website styles.
- public/: Static files and assets.

## Architecture Rules
1. Keep product information in `products.js` as the single source of truth.
2. Keep business rules in `logic.js` testable without a browser.
3. Change cart data through `state.js`; localStorage failures must leave the in-memory cart intact.
4. Add or change visual behavior through `ui.js`, not `main.js`.
5. Preserve accessible labels, live regions, keyboard behavior, and focus handling when changing UI.
6. Never sort the canonical `products` array in place; Default must restore its original order.
7. Use delegated product-grid events so repeated filtering never creates duplicate listeners.
8. Persist only cart IDs and quantities in localStorage; derive product details and totals from `products.js`.
