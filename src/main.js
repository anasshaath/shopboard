import './style.css'
import {
  findProduct,
  getCartDetails,
  getTotal,
  getVisibleProducts,
  validateCustomer,
  createOrderId,
} from './logic.js'
import {
  changeCart,
  clearCart,
  getCart,
  getView,
  removeFromCart,
  saveOrder,
  setView,
} from './state.js'
import { createUi } from './ui.js'

let placingOrder = false
const ui = createUi({
  addToCart(productId) {
    if (changeCart(productId, 1)) {
      render()
      ui.openCart()
    }
  },
  changeCart(productId, action) {
    const saved =
      action === 'remove'
        ? removeFromCart(productId)
        : changeCart(productId, action === 'increase' ? 1 : -1)
    if (saved) render()
  },
  showDetails(productId) {
    ui.openDetails(findProduct(productId))
  },
  search(search) {
    setView({ search })
    render()
  },
  filterCategory(category) {
    setView({ category })
    render()
  },
  changeView(control) {
    const view = getView()
    if (control === 'show-all')
      setView({
        search: '',
        category: 'all',
        under30: false,
        sortDirection: null,
      })
    else if (control === 'under-30') setView({ under30: !view.under30 })
    else
      setView({ sortDirection: control === 'sort-price-asc' ? 'asc' : 'desc' })
    render()
  },
  clearCart() {
    if (clearCart()) render()
  },
  checkout() {
    const items = getCartDetails(getCart())
    if (items.length) ui.showCheckout(items, getTotal(items))
  },
  placeOrder(customer) {
    if (placingOrder) return
    const errors = validateCustomer(customer)
    if (Object.keys(errors).length) {
      ui.showErrors(
        errors,
        'Please correct the highlighted fields before placing your demo order.',
      )
      return
    }
    const items = getCartDetails(getCart())
    if (!items.length) {
      ui.showErrors(
        {},
        'Your cart is empty. Add a product before placing a demo order.',
      )
      return
    }
    placingOrder = true
    const order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      customer,
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })),
      total: getTotal(items),
    }
    if (!saveOrder(order)) {
      ui.showErrors(
        {},
        'We could not save this demo order locally. Your cart has not changed.',
      )
      placingOrder = false
      return
    }
    const cartCleared = clearCart()
    render()
    ui.confirm(order, cartCleared)
    placingOrder = false
  },
})

function render() {
  const cart = getCartDetails(getCart())
  ui.render({
    products: getVisibleProducts(getView()),
    cart,
    view: getView(),
    total: getTotal(cart),
  })
}

render()
