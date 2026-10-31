// Slide 27 reproduces the failure modes as safe pure functions, not in the storefront.

export function renderProductNames(products) {
  return products
    .map((product) => `<article>${product.name}</article>`)
    .join('')
}

export function sortByPriceWithoutMutation(products) {
  return [...products].sort((first, second) => first.price - second.price)
}

export function saveCartAsJson(storage, cart) {
  storage.setItem('cart', JSON.stringify(cart))
}
