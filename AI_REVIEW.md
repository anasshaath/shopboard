# AI-assisted review: `ai-products.ts` exercise

This is an AI-assisted review of the exact exercise supplied for the Day 3
assignment. It is not an independent student review, and the flawed exercise
has not been added to the production import graph.

## Reviewed exercise (line-numbered)

```ts
 1 // ai-products.ts
 2 // An AI wrote this to load products from the ShopBoard API.
 3 // It compiles. TypeScript shows no errors. Would you merge it?
 4
 5 import type { Product } from "./types";
 6
 7 export async function getProducts(): Promise<Product[]> {
 8   try {
 9     const res = await fetch("https://shopboard-api.vercel.app/api/products");
10     const data: any = await res.json();
11     return data.items as Product[];
12   } catch (e) {
13     console.log(e);
14     return [];
15   }
16 }
17
18 export async function getProduct(id: string): Promise<Product> {
19   const res = await fetch("https://shopboard-api.vercel.app/api/products/" + id);
20   const product = (await res.json()) as Product;
21   return product;
22 }
23
24 export async function showProducts() {
25   const grid = document.querySelector("#product-grid")!;
26   const products = await getProducts();
27   grid.innerHTML = products
28     .map((p) => `<article><h3>${p.name}</h3><p>$${p.price.toFixed(2)}</p></article>`)
29     .join("");
30 }
```

## Verified findings

| Original line and code                                                                          | What is wrong                                                                                                                                                                                             | User-facing risk                                                                                                                         | Concrete fix                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **10**: `const data: any = await res.json();`                                                   | `any` disables compile-time checks for untrusted JSON.                                                                                                                                                    | Malformed API data can reach the UI unnoticed and fail later.                                                                            | Keep JSON as `unknown` and pass it to a runtime decoder.                                                                         |
| **11**: `return data.items as Product[];`                                                       | The assertion validates nothing. The verified collection payload has `title`, `category_name`, `price_cents`, and `in_stock`, while app `Product` uses `name`, `category`, dollar `price`, and `inStock`. | Names/categories can be absent, stock is lost, and cents can display as dollars (for example, `8900` as `$8900.00` instead of `$89.00`). | Decode the API response and map each item with `toProduct()`, including `price_cents / 100`.                                     |
| **9**: `const res = await fetch("https://shopboard-api.vercel.app/api/products");`              | It bypasses the shared client and reads JSON without checking `res.ok`. Fetch resolves normally for HTTP 4xx/5xx responses.                                                                               | Error payloads can be treated as product data, producing a broken or blank catalog.                                                      | Use `fetchJson()` from `src/shared/api/client.ts`; it throws `ApiError` with status before successful JSON decoding.             |
| **12–14**: `} catch (e) { console.log(e); return []; }`                                         | It swallows every network, HTTP, and validation failure and converts it into a valid-looking empty result.                                                                                                | People see “no products” instead of a recoverable service error and cannot distinguish outage from an empty catalog.                     | Preserve an explicit error state, render retry UI, and optionally show a toast; do not silently return `[]`.                     |
| **18–20**: `getProduct(id: string)` / `fetch(... + id)` / `(await res.json()) as Product`       | The ID is unvalidated and concatenated unencoded into a URL; the response is asserted rather than decoded.                                                                                                | Invalid IDs can create malformed requests, and unexpected details data can break product rendering.                                      | Accept a validated numeric ID, encode it, use `fetchJson()`, and decode a response only after its endpoint contract is verified. |
| **25**: `const grid = document.querySelector("#product-grid")!;`                                | The non-null assertion hides a possible missing DOM element.                                                                                                                                              | A template change turns into an opaque runtime exception before feedback can render.                                                     | Narrow the result with `instanceof HTMLElement` and throw a clear setup error or return safely.                                  |
| **27–29**: `grid.innerHTML = products.map((p) => \`<article><h3>${p.name}</h3>...\`).join("");` | API text is interpolated as HTML.                                                                                                                                                                         | A malicious or malformed product name can inject markup into the page.                                                                   | Create elements and set API-derived text with `textContent`.                                                                     |

## `getProduct` needs separate contract verification

The collection endpoint contract is verified for `/api/products`; this review
does **not** assume that `/api/products/:id` exists or returns the same wrapper
or item shape. A safe implementation starts by rejecting non-positive,
non-integer IDs and URL-encoding the validated value. It should call
`fetchJson()` with a dedicated decoder only after the detail endpoint’s real
response contract is documented and tested.

## Corrected illustrative example (not production code)

The production app already keeps DOM work in `src/ui.ts`; this isolated example
shows the safe API and DOM patterns only.

```ts
import { fetchJson } from './shared/api/client.ts'
import {
  decodeProductsResponse,
  toProduct,
} from './modules/products/products.api.ts'
import type { Product } from './modules/products/products.types.ts'

async function loadProducts(): Promise<Product[]> {
  const response = await fetchJson('/api/products', decodeProductsResponse)
  return response.items.map(toProduct)
}

function requireGrid(): HTMLElement {
  const grid = document.querySelector('#product-grid')
  if (!(grid instanceof HTMLElement)) {
    throw new Error('Product grid is missing from the page.')
  }
  return grid
}

export async function showProducts(): Promise<void> {
  const grid = requireGrid()
  try {
    const products = await loadProducts()
    grid.replaceChildren()
    for (const product of products) {
      const article = document.createElement('article')
      const title = document.createElement('h3')
      const price = document.createElement('p')
      title.textContent = product.name
      price.textContent = `$${product.price.toFixed(2)}`
      article.append(title, price)
      grid.append(article)
    }
  } catch (error) {
    const message = document.createElement('p')
    message.setAttribute('role', 'alert')
    message.textContent =
      error instanceof Error
        ? `Products could not load: ${error.message}`
        : 'Products could not load.'
    grid.replaceChildren(message)
    throw error
  }
}
```

For a future verified details endpoint, use this ID boundary before a dedicated
decoder is introduced:

```ts
function requireProductId(id: number): string {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Product ID must be a positive integer.')
  }
  return encodeURIComponent(String(id))
}
```
