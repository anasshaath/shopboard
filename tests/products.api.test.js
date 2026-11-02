import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError, fetchJson } from '../src/shared/api/client.ts'
import {
  decodeProductsResponse,
  getProducts,
  toProduct,
} from '../src/modules/products/products.api.ts'

const tote = {
  id: 1,
  title: 'Leather Tote Bag',
  category_name: 'Bags',
  price_cents: 8900,
  in_stock: true,
}

async function withFetch(fetchImplementation, callback) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchImplementation
  try {
    await callback()
  } finally {
    globalThis.fetch = originalFetch
  }
}

test('maps API product fields and cents into the app product', () => {
  assert.deepEqual(toProduct(tote), {
    id: 1,
    name: 'Leather Tote Bag',
    category: 'Bags',
    price: 89,
    inStock: true,
  })
})

test('rejects invalid payloads and unsupported API categories', () => {
  assert.throws(() =>
    decodeProductsResponse({
      items: [{ ...tote, price_cents: '8900' }],
      total: 1,
    }),
  )
  assert.throws(() => toProduct({ ...tote, category_name: 'Home' }))
})

test('fetches and maps the products response', async () => {
  let requestedUrl = ''
  await withFetch(
    async (url) => {
      requestedUrl = String(url)
      return {
        ok: true,
        status: 200,
        json: async () => ({ items: [tote], total: 1 }),
      }
    },
    async () => {
      assert.deepEqual(await getProducts(), [toProduct(tote)])
    },
  )
  assert.equal(requestedUrl, 'https://shopboard-api.vercel.app/api/products')
})

test('throws ApiError without parsing an unsuccessful HTTP response', async () => {
  let jsonWasRead = false
  await withFetch(
    async () => ({
      ok: false,
      status: 503,
      json: async () => {
        jsonWasRead = true
        return {}
      },
    }),
    async () => {
      await assert.rejects(
        fetchJson('/api/products', (value) => value),
        (error) => error instanceof ApiError && error.status === 503,
      )
    },
  )
  assert.equal(jsonWasRead, false)
})
