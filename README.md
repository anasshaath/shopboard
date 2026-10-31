# ShopBoard

ShopBoard is a responsive demo storefront built for the Day 2 JavaScript and
DOM assignment. It renders a student-created product catalog dynamically and
keeps catalog browsing, cart behavior, and a local demo checkout in the
browser.

## Features

- Dynamic product cards from a single catalog data source
- Case-insensitive product and category search
- Category filtering, an Under $30 filter, and ascending/descending price
  sorting; clearing sorting restores the original catalog order
- Slide-out cart with a live quantity badge, quantity controls, removal, Clear
  Cart, line totals, and cart total
- Cart persistence in `localStorage`
- Accessible product-details modal, cart panel, and checkout flow with keyboard
  handling and focus management
- Local-only demo checkout with validation, a generated demo order ID, and an
  order confirmation saved to `localStorage`
- Responsive green-and-cream ShopBoard interface and SVG favicon

## Technology and development tools

- Vite
- Vanilla JavaScript, HTML, and CSS
- Node's built-in test runner
- ESLint and Prettier
- Husky and lint-staged for pre-commit checks

## Run locally

Requirements: a current Node.js version and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. To create a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
.
├── index.html                 # Page structure and accessible controls
├── public/                    # Static assets, including the favicon
├── src/
│   ├── products.js            # Canonical product catalog
│   ├── data.js                # Compatibility re-export for Day 2 exercises
│   ├── logic.js               # Pure catalog, cart, validation, and ID logic
│   ├── state.js               # Mutable state and localStorage persistence
│   ├── ui.js                  # DOM rendering, event listeners, focus behavior
│   ├── main.js                # Application composition and event actions
│   └── style.css              # Responsive styles
├── tests/                     # Node test-runner coverage
├── examples/day2/             # Isolated classroom examples and notes
└── .husky/pre-commit          # Staged-file checks and tests
```

The Day 2 architecture uses five application responsibilities:

1. `data.js` represents the assignment's data module and re-exports the
   catalog.
2. `logic.js` contains browser-independent business rules.
3. `state.js` owns mutable cart state and `localStorage` access.
4. `ui.js` is the only module that queries or changes the DOM.
5. `main.js` composes the modules and connects UI actions to state and logic.

`products.js` is the single source of truth for the catalog; `data.js` remains
as a small compatibility bridge for the earlier Day 2 examples.

## Store behavior

Search matches product names and categories without case sensitivity. Search,
category filtering, the Under $30 filter, and price sorting can be combined in
any order. Both price directions are available, while the Default control
clears the active view controls and restores the catalog's declared order.

The cart stores product IDs and quantities in `localStorage`; product details
and totals are derived from the catalog on each render. Customers can adjust a
quantity, remove an item, or clear the cart. Cart contents survive a refresh
when browser storage is available.

Checkout is explicitly **DEMO ONLY**. It validates contact and shipping fields,
saves a demo order locally, and clears the cart only after the order saves
successfully. It does not collect payment details, process payments, or send
customer data to a server.

## Quality checks

```bash
npm test
npm run build
npm run lint
npm run format:check
```

To apply Prettier formatting:

```bash
npm run format
```

Husky installs its hook through npm's `prepare` script. Before a commit,
`.husky/pre-commit` runs:

```bash
npx lint-staged
npm test
```

lint-staged runs ESLint and Prettier on staged JavaScript files. The hook can
be checked without making a commit:

```bash
git hook run pre-commit
```

## Day 2 homework material

The project includes dynamic rendering, search/filter/sort composition,
delegated product-card events, cart persistence, modular JavaScript, and
focused automated tests used for the Day 2 assignment. The student-created
catalog and exercise boundaries are documented in the project materials below:

- [Architecture and coding rules](AGENTS.MD)
- [Detailed architecture rules](CLAUDE.md)
- [Actual debugging findings and verification evidence](debugging-log.md)
- [Day 2 slide coverage checklist](DAY2-CHECKLIST.md)
- [Classroom-only exercises and DevTools notes](examples/day2/)
