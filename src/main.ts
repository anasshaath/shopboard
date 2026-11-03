import './style.css'
import {
  findProduct,
  getCartDetails,
  getTotal,
  getVisibleProducts,
  validateCustomer,
  createOrderId,
} from './modules/products/products.logic.ts'
import {
  changeCart,
  clearCart,
  getCart,
  getView,
  getUnavailableCartItems,
  removeFromCart,
  saveOrder,
  setView,
} from './modules/cart/cart.state.ts'
import { createUi } from './ui.ts'
import type { Category } from './modules/products/products.types.ts'
import type { Customer } from './modules/products/products.logic.ts'
import { getProducts } from './modules/products/products.api.ts'
import type { Product } from './modules/products/products.types.ts'
import { showToast } from './shared/ui/toast.ts'
import type { LoadState } from './modules/products/products.types.ts'
import { createProductsLoader } from './modules/products/products.loader.ts'

let placingOrder = false
let catalog: Product[] = []
let loadState: LoadState = { status: 'loading' }
const ui = createUi({
  addToCart(productId: number) {
    const product = findProduct(catalog, productId)
    if (!product?.inStock) {
      showToast('This product is currently out of stock.', 'info')
      return
    }
    if (changeCart(productId, 1)) {
      render()
      ui.openCart()
      showToast('Added to cart.', 'success')
    } else {
      showToast('We could not save this cart update.', 'error')
    }
  },
  changeCart(productId: number, action: 'increase' | 'decrease' | 'remove') {
    const saved =
      action === 'remove'
        ? removeFromCart(productId)
        : changeCart(productId, action === 'increase' ? 1 : -1)
    if (saved) render()
  },
  showDetails(productId: number) {
    ui.openDetails(findProduct(catalog, productId))
  },
  search(search: string) {
    setView({ search })
    render()
  },
  filterCategory(category: Category | 'all') {
    setView({ category })
    render()
  },
  changeView(control: string) {
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
    const savedCart = getCart()
    if (!hasAvailableCatalog()) {
      ui.showErrors(
        {},
        'Products are currently unavailable. Your saved cart is safe; try again when the catalog returns.',
      )
      return
    }
    if (getUnavailableCartItems(catalog).length) {
      ui.showErrors(
        {},
        'Some saved items are no longer available. Remove them before checkout.',
      )
      return
    }
    const items = getCartDetails(savedCart, catalog)
    if (items.length) ui.showCheckout(items, getTotal(items))
  },
  placeOrder(customer: Customer) {
    if (placingOrder) return
    const errors = validateCustomer(customer)
    if (Object.keys(errors).length) {
      ui.showErrors(
        errors,
        'Please correct the highlighted fields before placing your demo order.',
      )
      return
    }
    if (!hasAvailableCatalog()) {
      ui.showErrors(
        {},
        'Products are currently unavailable. Your saved cart is safe; try again when the catalog returns.',
      )
      return
    }
    if (getUnavailableCartItems(catalog).length) {
      ui.showErrors(
        {},
        'Some saved items are no longer available. Remove them before checkout.',
      )
      return
    }
    const items = getCartDetails(getCart(), catalog)
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
  retryProducts() {
    void productsLoader.load()
  },
})

function render() {
  const savedCart = getCart()
  const catalogAvailable = hasAvailableCatalog()
  const unavailableCartItems = catalogAvailable
    ? getUnavailableCartItems(catalog)
    : savedCart
  const cart = catalogAvailable ? getCartDetails(savedCart, catalog) : []
  const visibleProducts =
    loadState.status === 'success'
      ? getVisibleProducts(loadState.products, getView())
      : []
  ui.render({
    loadState,
    visibleProducts,
    cart,
    unavailableCartItems,
    catalogAvailable,
    view: getView(),
    total: getTotal(cart),
  })
}

function hasAvailableCatalog(): boolean {
  return loadState.status === 'success' && loadState.products.length > 0
}

const productsLoader = createProductsLoader(getProducts, {
  onStateChange(nextLoadState) {
    loadState = nextLoadState
    if (nextLoadState.status === 'success') {
      catalog = nextLoadState.products
    }
    render()
  },
  onError(message) {
    showToast(message, 'error')
  },
})

void productsLoader.load()
