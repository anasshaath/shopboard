import assert from 'node:assert/strict'
import test from 'node:test'
import { getCartDetails, getTotal } from '../src/logic.js'

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
  return import(`../src/state.js?test=${Math.random()}`)
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

  const items = getCartDetails(state.getCart())
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
