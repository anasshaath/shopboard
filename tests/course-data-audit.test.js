import assert from 'node:assert/strict'
import test from 'node:test'
import { products } from '../src/modules/products/products.ts'
import { getVisibleProducts } from '../src/modules/products/products.logic.ts'

test('matches the student-created Day 2 exercise dataset', () => {
  const baseView = { category: 'all', under30: false, sortDirection: null }
  const descending = getVisibleProducts(products, {
    ...baseView,
    search: '',
    sortDirection: 'desc',
  })

  assert.equal(products.length, 12)
  assert.equal(
    products.reduce((total, product) => total + product.price, 0),
    877,
  )
  assert.equal(
    getVisibleProducts(products, { ...baseView, search: 'bag' }).length,
    3,
  )
  assert.equal(
    getVisibleProducts(products, {
      ...baseView,
      search: '',
      category: 'Shoes',
    }).length,
    4,
  )
  assert.equal(descending[0].price, 150)
})
