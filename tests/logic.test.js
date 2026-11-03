import assert from 'node:assert/strict'
import test from 'node:test'
import { getVisibleProducts } from '../src/modules/products/products.logic.ts'
import { testProducts } from './fixtures/products.js'

test('sorts products by price in both directions', () => {
  const ascending = getVisibleProducts(testProducts, {
    search: '',
    category: 'all',
    under30: false,
    sortDirection: 'asc',
  })
  const descending = getVisibleProducts(testProducts, {
    search: '',
    category: 'all',
    under30: false,
    sortDirection: 'desc',
  })

  assert.deepEqual(
    ascending.map((product) => product.price),
    [24, 28, 52, 147, 149],
  )
  assert.deepEqual(
    descending.map((product) => product.price),
    [149, 147, 52, 28, 24],
  )
})

test('restores the original catalog order when sorting is cleared', () => {
  const productsInDefaultOrder = getVisibleProducts(testProducts, {
    search: '',
    category: 'all',
    under30: false,
    sortDirection: null,
  })

  assert.deepEqual(
    productsInDefaultOrder.map((product) => product.id),
    [2, 4, 11, 12, 7],
  )
})

test('combines search, category filtering, and price sorting', () => {
  const results = getVisibleProducts(testProducts, {
    search: 'bag',
    category: 'Bags',
    under30: false,
    sortDirection: 'desc',
  })

  assert.deepEqual(
    results.map((product) => product.id),
    [11, 4],
  )
})
