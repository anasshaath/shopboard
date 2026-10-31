export function operatorPredictions() {
  return {
    stringPlusNumber: '5' + 3,
    stringMinusNumber: '5' - 3,
    looseEquality: 5 == '5',
    strictEquality: 5 === '5',
  }
}

export function scopeExercise(shouldShadow = true) {
  let outerValue = 1
  if (shouldShadow) {
    const outerValue = 2
    void outerValue
  }
  return outerValue
}

export function destructuringExercise(product) {
  const { name, price = 10, stock = 5 } = product
  return { name, price, stock }
}

export function spreadExercise() {
  const original = [1, 2]
  const alias = original
  const copy = [...original]
  alias.push(3)
  return {
    originalLength: original.length,
    copyLength: copy.length,
    itemCount: countItems(1, 2, 3),
  }
}

export function countItems(...items) {
  return items.length
}

export function arrayWorkout(products) {
  return {
    names: products.map((product) => product.name),
    under50: products.filter((product) => product.price < 50),
    cheapestFirst: [...products].sort(
      (first, second) => first.price - second.price,
    ),
    productById: (id) => products.find((product) => product.id === id),
    total: products.reduce((sum, product) => sum + product.price, 0),
  }
}
