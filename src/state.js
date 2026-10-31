import { products } from './products.js'

const cartKey = 'shopboard-cart'
const ordersKey = 'shopboard-demo-orders'

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey))
    return Array.isArray(saved)
      ? saved.filter(
          (item) =>
            products.some((product) => product.id === item.id) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        )
      : []
  } catch {
    return []
  }
}

let cart = loadCart()
let view = { search: '', category: 'all', under30: false, sortDirection: null }

export const getCart = () => cart
export const getView = () => view
export const setView = (change) => {
  view = { ...view, ...change }
}

function persistCart(nextCart) {
  try {
    localStorage.setItem(cartKey, JSON.stringify(nextCart))
    cart = nextCart
    return true
  } catch {
    return false
  }
}

export function changeCart(productId, adjustment) {
  const current = cart.find((item) => item.id === productId)
  const next = current
    ? cart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + adjustment }
            : item,
        )
        .filter((item) => item.quantity > 0)
    : adjustment > 0
      ? [...cart, { id: productId, quantity: adjustment }]
      : cart
  return persistCart(next)
}

export const removeFromCart = (productId) =>
  persistCart(cart.filter((item) => item.id !== productId))
export const clearCart = () => persistCart([])

export function saveOrder(order) {
  try {
    const saved = JSON.parse(localStorage.getItem(ordersKey))
    const orders = Array.isArray(saved) ? saved : []
    localStorage.setItem(ordersKey, JSON.stringify([...orders, order]))
    return true
  } catch {
    return false
  }
}
