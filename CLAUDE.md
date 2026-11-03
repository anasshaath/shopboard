# ShopBoard

Read `AGENTS.md` first. It is the source of truth for the current TypeScript
stack, folder ownership, and feature-placement rules.

## Working conventions

1. Use semantic HTML, labels for form inputs, responsive mobile-first CSS, and
   no `!important`.
2. Explain the planned code change before editing and preserve accessible live
   regions, keyboard behavior, and focus handling.
3. Keep DOM queries, rendering, and event listeners in `src/ui.ts`; compose
   actions in `src/main.ts`; keep feature logic and state outside the DOM.
4. Put a new feature in `src/modules/<feature>/`; put cross-feature code in
   `src/shared/`; put static assets in `public/`.
5. Change cart data only through `src/modules/cart/cart.state.ts`. Keep saved
   IDs and quantities when the catalog is temporarily empty or unavailable.
6. Never sort the catalog in place. Default view must restore the API catalog
   order, and delegated product-grid events must not be duplicated.

## Rules derived from documented AI-review findings

The evidence for rules 7-10 is the supplied exercise review in
`AI_REVIEW.md`, especially lines 46-52.

7. Keep untrusted JSON as `unknown`; do not use `any`, `as` assertions, or
   non-null assertions to bypass validation.
8. Only `src/shared/api/client.ts` may call `fetch`. It must check `res.ok`
   before decoding success data, and each feature API module must validate and
   map its own endpoint shape.
9. Treat a network, HTTP, or decoding failure as an error state. Do not catch
   it and return an empty catalog, because an outage is not an empty store.
10. Render API-derived strings with created DOM elements and `textContent`, not
    HTML interpolation.
