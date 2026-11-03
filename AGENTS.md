# ShopBoard

## Stack and coding rules

- Vite with TypeScript, HTML, and CSS.
- Use semantic HTML, labels for every form input, and mobile-first styles.
- Avoid `!important`.
- Explain planned code changes before editing.

## Current architecture

- `src/main.ts`: application composition only. It connects loaders, state, UI
  actions, and toasts; it must not query or mutate the DOM directly.
- `src/ui.ts`: the only module that queries or changes the DOM. It owns DOM
  rendering, event listeners, dialogs, live regions, and focus handling.
- `src/style.css`: responsive storefront styles.
- `src/modules/products/`: product feature code.
  - `products.types.ts`: app product, category, view, and load-state types.
  - `products.api.ts`: endpoint-specific decoding and API-to-app mapping.
  - `products.loader.ts`: request lifecycle and retry transitions.
  - `products.logic.ts`: browser-independent catalog and checkout helpers.
  - `products.ui.ts`: pure catalog render-model selection.
  - `products.visuals.ts`: local artwork metadata keyed by stable product ID.
- `src/modules/cart/`: cart types and localStorage-backed cart/view state.
- `src/shared/api/client.ts`: the only module allowed to call `fetch`.
- `src/shared/ui/toast.ts`: shared toast API.
- `public/`: static assets, including the favicon and product artwork.

## Where new code goes

- Put feature-specific types, state, API mapping, and pure logic in
  `src/modules/<feature>/`.
- Put code shared by more than one feature in `src/shared/`.
- Keep browser DOM work in `src/ui.ts`; pass actions from `src/main.ts` rather
  than querying the DOM from feature or state modules.
- Add local static assets to `public/`. Keep API-specific field names inside
  the relevant feature API mapper.

## Guardrails

- Keep business rules browser-independent where possible and test them without
  a browser.
- Change cart data through `cart.state.ts`; a localStorage failure must retain
  the current in-memory cart.
- Preserve accessible labels, live regions, keyboard interactions, and focus
  handling when changing UI.
- Sort copies of product data only; Default must restore the catalog order.
- Attach product interactions through delegated grid listeners so filtering
  never duplicates handlers.
- Persist only cart IDs and quantities. Do not silently delete saved cart
  entries when a catalog is empty or unavailable; make genuinely unavailable
  items explicit to the user.
- Route HTTP requests through the shared client. Check `res.ok`, keep JSON as
  `unknown`, decode the endpoint response, and map it to app types.
- Render API-derived text with DOM nodes and `textContent`; narrow DOM lookups
  instead of hiding missing elements with non-null assertions.
