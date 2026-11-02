import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getCartDetails,
  getTotal,
} from '../src/modules/products/products.logic.ts'
import { createProductsLoader } from '../src/modules/products/products.loader.ts'
import { products } from '../src/modules/products/products.ts'

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    snapshot: () => Object.fromEntries(values),
  }
}

async function loadState(storage) {
  globalThis.localStorage = storage
  return import(`../src/modules/cart/cart.state.ts?test=${Math.random()}`)
}

test('updates quantities, totals, and persisted cart data', async () => {
  const storage = createStorage()
  const state = await loadState(storage)

  assert.equal(state.changeCart(11, 1), true)
  assert.equal(state.changeCart(11, 1), true)
  assert.equal(state.changeCart(7, 1), true)
  assert.deepEqual(state.getCart(), [
    { id: 11, quantity: 2 },
    { id: 7, quantity: 1 },
  ])

  const items = getCartDetails(state.getCart(), products)
  assert.equal(
    items.reduce((count, item) => count + item.quantity, 0),
    3,
  )
  assert.equal(getTotal(items), 253)
  assert.equal(
    storage.snapshot()['shopboard-cart'],
    '[{"id":11,"quantity":2},{"id":7,"quantity":1}]',
  )
})

test('loads a persisted cart after a module reload', async () => {
  const storage = createStorage({
    'shopboard-cart': '[{"id":11,"quantity":2},{"id":7,"quantity":1}]',
  })
  const state = await loadState(storage)

  assert.deepEqual(state.getCart(), [
    { id: 11, quantity: 2 },
    { id: 7, quantity: 1 },
  ])
})

test('clears every cart item and persists an empty cart', async () => {
  const storage = createStorage({
    'shopboard-cart': '[{"id":11,"quantity":2},{"id":7,"quantity":1}]',
  })
  const state = await loadState(storage)

  assert.equal(state.clearCart(), true)
  assert.deepEqual(state.getCart(), [])
  assert.equal(storage.snapshot()['shopboard-cart'], '[]')
})

test('reports stored cart entries that are absent from a successful API catalog without removing them', async () => {
  const storage = createStorage({
    'shopboard-cart': '[{"id":11,"quantity":2},{"id":999,"quantity":1}]',
  })
  const state = await loadState(storage)

  assert.deepEqual(
    state.getUnavailableCartItems([
      {
        id: 11,
        name: 'Rain Boots',
        category: 'Shoes',
        price: 60,
        inStock: true,
      },
    ]),
    [{ id: 999, quantity: 1 }],
  )
  assert.deepEqual(state.getCart(), [
    { id: 11, quantity: 2 },
    { id: 999, quantity: 1 },
  ])
  assert.equal(
    storage.snapshot()['shopboard-cart'],
    '[{"id":11,"quantity":2},{"id":999,"quantity":1}]',
  )
})

test('keeps saved cart items when the catalog is empty or a product is unavailable', async () => {
  const storage = createStorage({
    'shopboard-cart': '[{"id":11,"quantity":2},{"id":999,"quantity":1}]',
  })
  const state = await loadState(storage)

  assert.deepEqual(state.getUnavailableCartItems([]), [
    { id: 11, quantity: 2 },
    { id: 999, quantity: 1 },
  ])
  assert.deepEqual(state.getCart(), [
    { id: 11, quantity: 2 },
    { id: 999, quantity: 1 },
  ])
  assert.equal(
    storage.snapshot()['shopboard-cart'],
    '[{"id":11,"quantity":2},{"id":999,"quantity":1}]',
  )

  assert.deepEqual(
    state.getUnavailableCartItems([
      {
        id: 11,
        name: 'Rain Boots',
        category: 'Shoes',
        price: 60,
        inStock: true,
      },
    ]),
    [{ id: 999, quantity: 1 }],
  )
  assert.equal(state.removeFromCart(999), true)
  assert.deepEqual(state.getCart(), [{ id: 11, quantity: 2 }])
})

test('keeps a saved cart through a failed request and restores it when the catalog returns', async () => {
  const storage = createStorage({
    'shopboard-cart': '[{"id":11,"quantity":2}]',
  })
  const state = await loadState(storage)
  let attempts = 0
  let returnedCatalog = []
  const loader = createProductsLoader(
    async () => {
      attempts += 1
      if (attempts === 1) throw new Error('Offline')
      return [
        {
          id: 11,
          name: 'Rain Boots',
          category: 'Shoes',
          price: 60,
          inStock: true,
        },
      ]
    },
    {
      onStateChange: (loadState) => {
        if (loadState.status === 'success') returnedCatalog = loadState.products
      },
      onError: () => {},
    },
  )

  await loader.load()
  assert.deepEqual(state.getCart(), [{ id: 11, quantity: 2 }])
  assert.equal(storage.snapshot()['shopboard-cart'], '[{"id":11,"quantity":2}]')

  await loader.load()
  assert.deepEqual(state.getUnavailableCartItems(returnedCatalog), [])
  assert.deepEqual(getCartDetails(state.getCart(), returnedCatalog), [
    {
      id: 11,
      quantity: 2,
      product: {
        id: 11,
        name: 'Rain Boots',
        category: 'Shoes',
        price: 60,
        inStock: true,
      },
    },
  ])
})

test('decreases a quantity to removal and removes only the chosen product', async () => {
  const storage = createStorage()
  const state = await loadState(storage)

  state.changeCart(11, 2)
  state.changeCart(7, 1)
  assert.equal(state.changeCart(11, -1), true)
  assert.deepEqual(state.getCart(), [
    { id: 11, quantity: 1 },
    { id: 7, quantity: 1 },
  ])

  assert.equal(state.changeCart(11, -1), true)
  assert.deepEqual(state.getCart(), [{ id: 7, quantity: 1 }])
  assert.equal(state.removeFromCart(7), true)
  assert.deepEqual(state.getCart(), [])
})
