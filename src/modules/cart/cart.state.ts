import type { Product, ProductView } from '../products/products.types.ts'
import type { Cart, CartItem } from './cart.types.ts'

const cartKey = 'shopboard-cart'
const ordersKey = 'shopboard-demo-orders'

export interface Order {
  id: string
  createdAt: string
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  items: Array<{ id: number; name: string; price: number; quantity: number }>
  total: number
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  if (!('id' in value) || !('quantity' in value)) return false
  return (
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0
  )
}

function loadCart(): Cart {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(cartKey) ?? '[]')
    return Array.isArray(saved) ? saved.filter(isCartItem) : []
  } catch {
    return []
  }
}

let cart: Cart = loadCart()
let view: ProductView = {
  search: '',
  category: 'all',
  under30: false,
  sortDirection: null,
}

export const getCart = (): Cart => cart
export const getView = (): ProductView => view
export const setView = (change: Partial<ProductView>): void => {
  view = { ...view, ...change }
}

function persistCart(nextCart: Cart): boolean {
  try {
    localStorage.setItem(cartKey, JSON.stringify(nextCart))
    cart = nextCart
    return true
  } catch {
    return false
  }
}

export function changeCart(productId: number, adjustment: number): boolean {
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

export const removeFromCart = (productId: number): boolean =>
  persistCart(cart.filter((item) => item.id !== productId))
export const clearCart = (): boolean => persistCart([])

export function getUnavailableCartItems(catalog: Product[]): Cart {
  return cart.filter(
    (item) => !catalog.some((product) => product.id === item.id),
  )
}

export function saveOrder(order: Order): boolean {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(ordersKey) ?? '[]')
    const orders: unknown[] = Array.isArray(saved) ? saved : []
    localStorage.setItem(ordersKey, JSON.stringify([...orders, order]))
    return true
  } catch {
    return false
  }
}
