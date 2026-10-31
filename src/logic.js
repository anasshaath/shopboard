import { products } from './products.js'

export const findProduct = (id) => products.find((product) => product.id === id)

export function getVisibleProducts({
  search,
  category,
  under30,
  sortDirection,
}) {
  const term = search.trim().toLowerCase()
  const visible = products.filter((product) => {
    const matchesSearch = [product.name, product.category].some((value) =>
      value.toLowerCase().includes(term),
    )
    return (
      matchesSearch &&
      (category === 'all' || product.category === category) &&
      (!under30 || product.price < 30)
    )
  })
  if (!sortDirection) return visible
  return visible.sort((first, second) =>
    sortDirection === 'asc'
      ? first.price - second.price
      : second.price - first.price,
  )
}

export function getCartDetails(cart) {
  return cart
    .map((item) => ({ ...item, product: findProduct(item.id) }))
    .filter((item) => item.product)
}

export const getTotal = (items) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0)

export function validateCustomer(customer) {
  const errors = {}
  if (!customer.fullName.trim())
    errors.fullName = 'Please enter your full name.'
  if (!customer.email.trim() || !/^\S+@\S+\.\S+$/.test(customer.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!/^[0-9+(). -]{7,}$/.test(customer.phone.trim())) {
    errors.phone = 'Please enter a valid phone number.'
  }
  if (!customer.address.trim())
    errors.address = 'Please enter your shipping address.'
  if (!customer.city.trim()) errors.city = 'Please enter your city.'
  return errors
}

export function createOrderId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
