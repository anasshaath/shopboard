import assert from 'node:assert/strict'
import test from 'node:test'
import { products } from '../src/products.js'
import { getVisibleProducts } from '../src/logic.js'

test('matches the student-created Day 2 exercise dataset', () => {
  const baseView = { category: 'all', under30: false, sortDirection: null }
  const descending = getVisibleProducts({
    ...baseView,
    search: '',
    sortDirection: 'desc',
  })

  assert.equal(products.length, 12)
  assert.equal(
    products.reduce((total, product) => total + product.price, 0),
    877,
  )
  assert.equal(getVisibleProducts({ ...baseView, search: 'bag' }).length, 3)
  assert.equal(
    getVisibleProducts({ ...baseView, search: '', category: 'Shoes' }).length,
    4,
  )
  assert.equal(descending[0].price, 150)
})
