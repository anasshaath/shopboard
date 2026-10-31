import assert from 'node:assert/strict'
import test from 'node:test'
import { getVisibleProducts } from '../src/logic.js'

test('sorts products by price in both directions', () => {
  const ascending = getVisibleProducts({
    search: '',
    category: 'all',
    under30: false,
    sortDirection: 'asc',
  })
  const descending = getVisibleProducts({
    search: '',
    category: 'all',
    under30: false,
    sortDirection: 'desc',
  })

  assert.deepEqual(
    ascending.map((product) => product.price),
    [18, 22, 24, 28, 32, 52, 65, 90, 100, 147, 149, 150],
  )
  assert.deepEqual(
    descending.map((product) => product.price),
    [150, 149, 147, 100, 90, 65, 52, 32, 28, 24, 22, 18],
  )
})

test('restores the original catalog order when sorting is cleared', () => {
  const productsInDefaultOrder = getVisibleProducts({
    search: '',
    category: 'all',
    under30: false,
    sortDirection: null,
  })

  assert.deepEqual(
    productsInDefaultOrder.map((product) => product.id),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  )
})

test('combines search, category filtering, and price sorting', () => {
  const results = getVisibleProducts({
    search: 'bag',
    category: 'Bags',
    under30: false,
    sortDirection: 'desc',
  })

  assert.deepEqual(
    results.map((product) => product.id),
    [12, 11, 4],
  )
})
