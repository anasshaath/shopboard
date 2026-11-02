import assert from 'node:assert/strict'
import test from 'node:test'
import { createProductsLoader } from '../src/modules/products/products.loader.ts'
import { getProductsRenderModel } from '../src/modules/products/products.ui.ts'

const product = {
  id: 1,
  name: 'Leather Tote Bag',
  category: 'Bags',
  price: 89,
  inStock: true,
}

test('chooses distinct render models for each catalog state', () => {
  assert.deepEqual(getProductsRenderModel({ status: 'loading' }, []), {
    status: 'loading',
  })
  assert.deepEqual(
    getProductsRenderModel({ status: 'error', message: 'Unavailable' }, []),
    {
      status: 'error',
      message: 'Unavailable',
      retryLabel: 'Try again',
    },
  )
  assert.deepEqual(
    getProductsRenderModel({ status: 'success', products: [] }, []),
    { status: 'empty' },
  )
  assert.deepEqual(
    getProductsRenderModel({ status: 'success', products: [product] }, []),
    { status: 'no-matches' },
  )
  assert.deepEqual(
    getProductsRenderModel({ status: 'success', products: [product] }, [
      product,
    ]),
    { status: 'products', products: [product] },
  )
})

test('deduplicates an active request and publishes its success state once', async () => {
  let resolveProducts
  let requestCount = 0
  const states = []
  const loader = createProductsLoader(
    () => {
      requestCount += 1
      return new Promise((resolve) => {
        resolveProducts = resolve
      })
    },
    {
      onStateChange: (state) => states.push(state),
      onError: () => assert.fail('The request should not fail.'),
    },
  )

  const first = loader.load()
  const second = loader.load()
  assert.equal(first, second)
  assert.equal(requestCount, 1)
  resolveProducts([product])
  await first
  assert.deepEqual(states, [
    { status: 'loading' },
    { status: 'success', products: [product] },
  ])
})

test('renders a retry action after failure and succeeds when retried', async () => {
  let attempts = 0
  const states = []
  const errors = []
  const loader = createProductsLoader(
    async () => {
      attempts += 1
      if (attempts === 1) throw new Error('Offline')
      return [product]
    },
    {
      onStateChange: (state) => states.push(state),
      onError: (message) => errors.push(message),
    },
  )

  await loader.load()
  const errorState = states.at(-1)
  assert.deepEqual(getProductsRenderModel(errorState, []), {
    status: 'error',
    message: 'We could not load the collection. Please try again.',
    retryLabel: 'Try again',
  })
  await loader.load()
  assert.deepEqual(states, [
    { status: 'loading' },
    {
      status: 'error',
      message: 'We could not load the collection. Please try again.',
    },
    { status: 'loading' },
    { status: 'success', products: [product] },
  ])
  assert.equal(errors.length, 1)
})
