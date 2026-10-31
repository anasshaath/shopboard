import assert from 'node:assert/strict'
import test from 'node:test'
import { products } from '../src/products.js'
import {
  arrayWorkout,
  destructuringExercise,
  operatorPredictions,
  scopeExercise,
  spreadExercise,
} from '../examples/day2/javascript-exercises.js'
import {
  renderProductNames,
  saveCartAsJson,
  sortByPriceWithoutMutation,
} from '../examples/day2/slide-27-ai-bugs.js'

test('covers the slide 6-14 prediction examples', () => {
  assert.deepEqual(operatorPredictions(), {
    stringPlusNumber: '53',
    stringMinusNumber: 2,
    looseEquality: true,
    strictEquality: false,
  })
  assert.equal(scopeExercise(), 1)
  assert.deepEqual(destructuringExercise({ name: 'Bag', price: 0 }), {
    name: 'Bag',
    price: 0,
    stock: 5,
  })
  assert.deepEqual(spreadExercise(), {
    originalLength: 3,
    copyLength: 2,
    itemCount: 3,
  })
})

test('covers the slide 17-19 array methods without mutating source data', () => {
  const workout = arrayWorkout(products)
  assert.equal(workout.names.length, 12)
  assert.equal(workout.under50.length, 5)
  assert.equal(workout.productById(4).name, 'The Go-Anywhere Tote')
  assert.equal(workout.total, 877)
  assert.deepEqual(
    workout.cheapestFirst.map((product) => product.price),
    [18, 22, 24, 28, 32, 52, 65, 90, 100, 147, 149, 150],
  )
  assert.deepEqual(
    products.map((product) => product.price),
    [18, 24, 65, 28, 32, 22, 149, 150, 100, 90, 52, 147],
  )
})

test('fixes all three slide 27 AI bug examples in isolation', () => {
  assert.equal(
    renderProductNames([{ name: 'Bag' }, { name: 'Mug' }]),
    '<article>Bag</article><article>Mug</article>',
  )
  const source = [{ price: 10 }, { price: 1 }]
  assert.deepEqual(
    sortByPriceWithoutMutation(source).map((product) => product.price),
    [1, 10],
  )
  assert.deepEqual(
    source.map((product) => product.price),
    [10, 1],
  )
  const values = new Map()
  saveCartAsJson({ setItem: (key, value) => values.set(key, value) }, [
    { id: 1, quantity: 2 },
  ])
  assert.equal(values.get('cart'), '[{"id":1,"quantity":2}]')
})
