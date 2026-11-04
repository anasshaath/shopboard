# Debugging log

## Bug 1

- **What I saw:** Historical Day 3 code rendered catalog API text as HTML in product, cart, and checkout views. This is a historical code observation, not a documented personal manual observation.
- **Type:** runtime
- **How I found it:** Code inspection: `git show d911297:src/ui.ts` shows the HTML insertion. Historical automated evidence: [commit `7f789ef`](https://github.com/anasshaath/shopboard/commit/7f789ef35f19d38e2f2033f8b248359c443e0630) added `tests/product-rendering.browser.cjs` with a malicious product name. Current automated check: after correcting its cart interaction, the script was run separately and exited `0`. Personal manual testing: none is documented in repository history or performed for this log.
- **Cause:** `src/ui.ts:109`, `src/ui.ts:221`, and `src/ui.ts:458` in commit `d911297` used `insertAdjacentHTML` or `innerHTML` with API-derived product text. Markup in a product name could become DOM instead of literal text.
- **Fix:** [Commit `7f789ef`](https://github.com/anasshaath/shopboard/commit/7f789ef35f19d38e2f2033f8b248359c443e0630) replaced the affected API-derived HTML rendering with created DOM nodes and `textContent`, and added the browser regression.
- **Did I use AI? For what?** The user confirms that Codex assisted with reviewing, implementing, and testing this historical fix. This does not claim personal manual testing.

## Bug 2

- **What I saw:** Historical Day 3 catalog reconciliation removed saved cart IDs that were absent from an empty or incomplete successful catalog response. This is a historical code observation, not a documented personal manual observation.
- **Type:** state
- **How I found it:** Code inspection: `git show d911297:src/main.ts` shows the reconciliation call, and `git show d911297:src/modules/cart/cart.state.ts` shows the filtering and persistence. Historical automated evidence: [commit `7f789ef`](https://github.com/anasshaath/shopboard/commit/7f789ef35f19d38e2f2033f8b248359c443e0630) added preservation coverage in `tests/state.test.js` and `tests/cart-availability.browser.cjs`. Current automated check: after correcting its cart interaction, the script was run separately and exited `0`. Personal manual testing: none is documented in repository history or performed for this log.
- **Cause:** `src/main.ts:150` in commit `d911297` called `reconcileCart(catalog)` for every successful catalog response. `src/modules/cart/cart.state.ts:87-91` filtered the in-memory cart to IDs found in that response and persisted the result, which could discard saved entries. A failed request did not reach this call because the loader published an error state instead.
- **Fix:** [Commit `7f789ef`](https://github.com/anasshaath/shopboard/commit/7f789ef35f19d38e2f2033f8b248359c443e0630) removed destructive reconciliation, introduced `getUnavailableCartItems`, and updated the UI to retain and explain unavailable entries while checkout is disabled when needed.
- **Did I use AI? For what?** The user confirms that Codex assisted with reviewing, implementing, and testing this historical fix. This does not claim personal manual testing.

## Bug 3

- **What I saw:** Intentional debugging exercise performed now, not a historical Day 2 bug. After the temporary change, the user manually selected Price: Low to High and then Default without refreshing; the price-sorted order remained. After restoration, the user manually verified that the same sequence restored the original catalog order.
- **Type:** state
- **How I found it:** The user inspected `getVisibleProducts` at a DevTools breakpoint and observed `products === visible` returning `false` before the intentional change. Codex then applied the temporary change. The user manually reproduced the faulty UI behavior and, after the restoration and one refresh, manually verified the restored UI behavior.
- **Cause:** At `src/modules/products/products.logic.ts:36`, the temporary `products.sort(...)` call sorted the original catalog array in place. Default then read the already-mutated catalog. In contrast, `visible` is the new array returned by `products.filter(...)`, so `visible.sort(...)` does not mutate the original catalog.
- **Fix:** Codex restored `products.sort(...)` to `visible.sort(...)` at `src/modules/products/products.logic.ts:36`, preserving the comparator exactly.
- **Did I use AI? For what?** Codex applied and restored the temporary change. ChatGPT guided the manual debugging. The manual breakpoint inspection and UI observations are the user's reported work.
