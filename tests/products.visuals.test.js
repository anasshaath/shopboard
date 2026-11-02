import assert from 'node:assert/strict'
import test from 'node:test'
import { getProductVisual } from '../src/modules/products/products.visuals.ts'

test('provides a relevant local visual for every API product ID', () => {
  const visuals = Array.from({ length: 12 }, (_, index) =>
    getProductVisual(index + 1),
  )

  assert.equal(visuals.filter((visual) => visual.kind === 'css').length, 5)
  assert.equal(visuals.filter((visual) => visual.kind === 'svg').length, 7)
  for (const visual of visuals) {
    if (visual.kind === 'svg') {
      assert.match(visual.asset, /^\/product-art\/[a-z-]+\.svg$/)
    }
  }
})
