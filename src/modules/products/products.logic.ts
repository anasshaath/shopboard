import type { Cart, CartDetail } from '../cart/cart.types.ts'
import { products } from './products.ts'
import type { Product, ProductView } from './products.types.ts'

export interface Customer {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
}

export type CustomerErrors = Partial<Record<keyof Customer, string>>

export const findProduct = (id: number): Product | undefined =>
  products.find((product) => product.id === id)

export function getVisibleProducts(view: ProductView): Product[] {
  const term = view.search.trim().toLowerCase()
  const visible = products.filter((product) => {
    const matchesSearch = [product.name, product.category].some((value) =>
      value.toLowerCase().includes(term),
    )
    return (
      matchesSearch &&
      (view.category === 'all' || product.category === view.category) &&
      (!view.under30 || product.price < 30)
    )
  })
  if (!view.sortDirection) return visible
  return visible.sort((first, second) =>
    view.sortDirection === 'asc'
      ? first.price - second.price
      : second.price - first.price,
  )
}

export function getCartDetails(cart: Cart): CartDetail[] {
  return cart.flatMap((item) => {
    const product = findProduct(item.id)
    return product ? [{ ...item, product }] : []
  })
}

export const getTotal = (items: CartDetail[]): number =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0)

export function validateCustomer(customer: Customer): CustomerErrors {
  const errors: CustomerErrors = {}
  if (!customer.fullName.trim())
    errors.fullName = 'Please enter your full name.'
  if (!customer.email.trim() || !/^\S+@\S+\.\S+$/.test(customer.email))
    errors.email = 'Please enter a valid email address.'
  if (!/^[0-9+(). -]{7,}$/.test(customer.phone.trim()))
    errors.phone = 'Please enter a valid phone number.'
  if (!customer.address.trim())
    errors.address = 'Please enter your shipping address.'
  if (!customer.city.trim()) errors.city = 'Please enter your city.'
  return errors
}

export function createOrderId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
