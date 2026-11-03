# ShopBoard

ShopBoard is a responsive, TypeScript demo storefront. It loads its catalog
from the ShopBoard API, supports browsing and cart interactions in the
browser, and saves demo cart and order data in `localStorage`.

## Features

- Typed product API client with runtime decoding, HTTP status handling, and
  mapping from API fields to the app's `Product` type.
- Loading, error with retry, empty-catalog, no-match, and product-list states.
- Search, category filtering, Under $30 filtering, and price sorting.
- Persistent cart quantities, unavailable-item handling, demo checkout, and
  accessible toast notifications.
- Keyboard-accessible cart and product-detail dialogs, focus handling, and
  live status messages.

## Stack

- Vite, TypeScript, HTML, and CSS
- Node's built-in test runner
- ESLint with type-aware checks for application TypeScript, Prettier, Husky,
  and lint-staged

## Setup and scripts

Use a current Node.js version and npm.

```bash
npm install
npm run dev
```

Vite prints the local URL. Other scripts are defined in `package.json`:

```bash
npm run build
npm run preview
npm run typecheck
npm run lint
npm run format:check
npm test
```

`npm run lint` checks TypeScript application code plus JavaScript and CommonJS
test files. `npm test` runs the Node test suite. The browser regression files in `tests/`
are optional local checks: they require a running Vite server, Playwright, and
Chrome at the Windows path configured inside those files. They are not part of
the `npm test` script.

## API

The normal catalog request is:

```text
https://shopboard-api.vercel.app/api/products
```

Only `src/shared/api/client.ts` calls `fetch`. The products module validates
the response and maps `title`, `category_name`, `price_cents`, and `in_stock`
to the app's `Product` shape.

For manual API-state testing, use these live variants temporarily and then
restore the normal endpoint:

- Delayed response: `/delay/3000/api/products`
- HTTP failure: `/fail/500/api/products`
- Empty catalog: `/empty/api/products`

## Project structure

```text
src/
  main.ts                       # Composes product loading, state, and UI actions
  ui.ts                         # DOM rendering, listeners, dialogs, and focus
  style.css                     # Responsive storefront styles
  modules/
    products/
      products.types.ts         # Product, category, view, and load-state types
      products.api.ts           # API response validation and product mapping
      products.loader.ts        # Request lifecycle and retry state changes
      products.logic.ts         # Catalog, cart-detail, and checkout helpers
      products.ui.ts            # Pure catalog render-model selection
      products.visuals.ts       # Local artwork metadata keyed by product ID
    cart/
      cart.types.ts             # CartItem, Cart, and CartDetail types
      cart.state.ts             # Cart/view state and localStorage persistence
  shared/
    api/client.ts               # BASE_URL, ApiError, and fetchJson
    ui/toast.ts                 # Shared toast API
public/                         # Favicon and local product-art assets
tests/                          # Node and optional browser regression tests
  fixtures/                     # Shared catalog fixtures for Node tests
```

## Behavior notes

The cart stores only product IDs and quantities. A failed or empty catalog
does not erase saved cart entries; checkout stays disabled until a usable
catalog returns. A product absent from a successful non-empty catalog is
shown as unavailable and can be removed explicitly.

Checkout is demo-only: no payment is collected and no order is sent to a
server. Successful demo orders are stored locally in the browser.
