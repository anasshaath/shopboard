import type { CartDetail } from './modules/cart/cart.types.ts'
import type { Order } from './modules/cart/cart.state.ts'
import type {
  Customer,
  CustomerErrors,
} from './modules/products/products.logic.ts'
import type {
  Category,
  LoadState,
  Product,
  ProductView,
} from './modules/products/products.types.ts'
import { getProductsRenderModel } from './modules/products/products.ui.ts'
import { getProductVisual } from './modules/products/products.visuals.ts'
import { setToastRenderer, type ToastType } from './shared/ui/toast.ts'

interface UiActions {
  addToCart(productId: number): void
  changeCart(
    productId: number,
    action: 'increase' | 'decrease' | 'remove',
  ): void
  showDetails(productId: number): void
  search(search: string): void
  filterCategory(category: Category | 'all'): void
  changeView(control: string): void
  clearCart(): void
  checkout(): void
  placeOrder(customer: Customer): void
  retryProducts(): void
}

interface RenderData {
  loadState: LoadState
  visibleProducts: Product[]
  cart: CartDetail[]
  view: ProductView
  total: number
}

function isCategory(value: string): value is Category {
  return ['Bags', 'Shoes', 'Accessories'].includes(value)
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function createUi(actions: UiActions) {
  const $ = (selector: string): HTMLElement => {
    const element = document.querySelector(selector)
    if (!(element instanceof HTMLElement))
      throw new Error(`Missing element: ${selector}`)
    return element
  }
  const input = (id: string): HTMLInputElement => {
    const element = document.getElementById(id)
    if (!(element instanceof HTMLInputElement))
      throw new Error(`Missing input: ${id}`)
    return element
  }
  const form = (id: string): HTMLFormElement => {
    const element = document.getElementById(id)
    if (!(element instanceof HTMLFormElement))
      throw new Error(`Missing form: ${id}`)
    return element
  }
  const select = (id: string): HTMLSelectElement => {
    const element = document.getElementById(id)
    if (!(element instanceof HTMLSelectElement))
      throw new Error(`Missing select: ${id}`)
    return element
  }
  const grid = $('#product-grid')
  const catalogStatus = $('#catalog-status')
  const toasts = $('#toasts')
  const createArtwork = (productId: number): HTMLDivElement => {
    const visual = getProductVisual(productId)
    const art = document.createElement('div')
    art.className = `product-art ${visual.color}`
    art.setAttribute('aria-hidden', 'true')
    if (visual.kind === 'css') {
      art.innerHTML = visual.markup
    } else {
      const image = document.createElement('img')
      image.className = 'product-art-image'
      image.src = visual.asset
      image.alt = ''
      art.append(image)
    }
    return art
  }
  const cartPanel = $('#shopping-cart')
  const detailsModal = $('#product-details')
  const checkout = $('#checkout')
  const main = $('main')
  const footer = $('footer')
  let lastFocus: HTMLElement | null
  let detailsProduct: Product | undefined

  const productCard = (product: Product): HTMLElement => {
    const card = document.createElement('article')
    card.className = 'product'
    card.tabIndex = 0
    card.dataset.productId = String(product.id)
    card.append(createArtwork(product.id))
    card.insertAdjacentHTML(
      'beforeend',
      `<div class="product-info"><div><p class="category">${product.category}</p><h3>${product.name}</h3></div><p class="price">${currency.format(product.price)}</p></div><button class="add-to-cart" type="button" data-add-to-cart="${product.id}">Add to cart</button><button class="view-details" type="button" data-view-details="${product.id}">View details</button>`,
    )
    return card
  }

  function renderCatalogMessage(
    message: string,
    retry = false,
    retryLabel = 'Try again',
  ): void {
    const status = document.createElement('p')
    status.className = 'catalog-message'
    status.setAttribute('role', retry ? 'alert' : 'status')
    status.textContent = message
    if (!retry) {
      catalogStatus.replaceChildren(status)
      return
    }
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'button'
    button.dataset.retryProducts = 'true'
    button.textContent = retryLabel
    catalogStatus.replaceChildren(status, button)
  }

  function renderToast(message: string, type: ToastType): void {
    const toast = document.createElement('p')
    toast.className = `toast toast-${type}`
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status')
    toast.textContent = message
    toasts.append(toast)
    window.setTimeout(() => toast.remove(), 4000)
  }

  setToastRenderer(renderToast)

  function focusTrap(event: KeyboardEvent, modal: HTMLElement): void {
    if (event.key !== 'Tab') return
    const targets = [
      ...modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled])',
      ),
    ]
    const first = targets[0]
    const last = targets.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      if (last instanceof HTMLElement) last.focus()
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      if (first instanceof HTMLElement) first.focus()
    }
  }

  function closeCart() {
    cartPanel.classList.remove('is-open')
    cartPanel.setAttribute('aria-hidden', 'true')
    $('#cart-toggle').setAttribute('aria-expanded', 'false')
    $('#cart-backdrop').hidden = true
    document.body.classList.remove('cart-open')
    if (lastFocus) lastFocus.focus()
  }

  function openCart() {
    lastFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    $('#cart-backdrop').hidden = false
    cartPanel.classList.add('is-open')
    cartPanel.setAttribute('aria-hidden', 'false')
    $('#cart-toggle').setAttribute('aria-expanded', 'true')
    document.body.classList.add('cart-open')
    $('#cart-close').focus()
  }

  function closeDetails() {
    detailsModal.classList.remove('is-open')
    detailsModal.setAttribute('aria-hidden', 'true')
    $('#details-backdrop').hidden = true
    document.body.classList.remove('details-open')
    if (lastFocus) lastFocus.focus()
  }

  function openDetails(product: Product | undefined): void {
    if (!product) return
    detailsProduct = product
    lastFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    $('#details-art').replaceChildren(createArtwork(product.id))
    $('#details-category').textContent = product.category
    $('#details-title').textContent = product.name
    $('#details-price').textContent = currency.format(product.price)
    $('#details-description').textContent = ''
    $('#details-description').hidden = true
    $('#details-backdrop').hidden = false
    detailsModal.classList.add('is-open')
    detailsModal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('details-open')
    $('#details-close').focus()
  }

  function renderOrderItems(
    container: HTMLElement,
    items: Array<CartDetail | Order['items'][number]>,
  ): void {
    container.innerHTML = items
      .map((item) => {
        const product = 'product' in item ? item.product : item
        return `<div class="checkout-item"><div><h3>${product.name}</h3><p>${item.quantity} × ${currency.format(product.price)}</p></div><strong>${currency.format(product.price * item.quantity)}</strong></div>`
      })
      .join('')
  }

  function showCheckout(items: CartDetail[], total: number): void {
    closeCart()
    renderOrderItems($('#checkout-items'), items)
    $('#checkout-total').textContent = currency.format(total)
    checkout.hidden = false
    main.hidden = true
    footer.hidden = true
    window.scrollTo(0, 0)
    $('#checkout-name').focus()
  }

  function showStorefront(openCartAfter = false) {
    checkout.hidden = true
    main.hidden = false
    footer.hidden = false
    $('#checkout-form-view').hidden = false
    $('#order-confirmation').hidden = true
    if (openCartAfter) openCart()
  }

  function customer(): Customer {
    return {
      fullName: input('checkout-name').value,
      email: input('checkout-email').value,
      phone: input('checkout-phone').value,
      address: input('checkout-address').value,
      city: input('checkout-city').value,
      postalCode: input('checkout-postal').value,
    }
  }

  function showErrors(errors: CustomerErrors, general = ''): void {
    const checkoutForm = form('checkout-form')
    checkoutForm.querySelectorAll('.field-error').forEach((element) => {
      element.textContent = ''
    })
    checkoutForm.querySelectorAll('input').forEach((field) => {
      if (field instanceof HTMLInputElement)
        field.removeAttribute('aria-invalid')
    })
    Object.entries(errors).forEach(([name, message]) => {
      const id = name === 'fullName' ? 'name' : name
      const field = checkoutForm.elements.namedItem(name)
      if (field instanceof HTMLInputElement)
        field.setAttribute('aria-invalid', 'true')
      $(`#checkout-${id}-error`).textContent = message
    })
    const error = $('#checkout-error')
    error.textContent = general
    error.hidden = !general
    const first = checkoutForm.querySelector('[aria-invalid="true"]')
    if (first instanceof HTMLElement) first.focus()
  }

  function clearErrors() {
    showErrors({}, '')
  }

  grid.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const add = event.target.closest('[data-add-to-cart]')
    const detail = event.target.closest('[data-view-details]')
    if (add instanceof HTMLElement)
      actions.addToCart(Number(add.dataset.addToCart))
    else if (detail instanceof HTMLElement)
      actions.showDetails(Number(detail.dataset.viewDetails))
    else {
      const card = event.target.closest('.product')
      if (card instanceof HTMLElement)
        actions.showDetails(Number(card.dataset.productId))
    }
  })
  catalogStatus.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const retry = event.target.closest('[data-retry-products]')
    if (retry instanceof HTMLButtonElement) actions.retryProducts()
  })
  grid.addEventListener('keydown', (event) => {
    if (!(event.target instanceof HTMLElement)) return
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      event.target.matches('.product')
    ) {
      event.preventDefault()
      actions.showDetails(Number(event.target.dataset.productId))
    }
  })
  input('product-search').addEventListener('input', () =>
    actions.search(input('product-search').value),
  )
  select('category-filter').addEventListener('change', () => {
    const category = select('category-filter').value
    if (category === 'all' || isCategory(category))
      actions.filterCategory(category)
  })
  $('.product-controls').addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest('button')
    if (button instanceof HTMLElement) actions.changeView(button.id)
  })
  $('#cart-toggle').addEventListener('click', openCart)
  $('#cart-close').addEventListener('click', closeCart)
  $('#continue-shopping').addEventListener('click', closeCart)
  $('#cart-backdrop').addEventListener('click', closeCart)
  $('#clear-cart').addEventListener('click', actions.clearCart)
  $('#cart-items').addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest('[data-cart-action]')
    if (button instanceof HTMLElement) {
      const action = button.dataset.cartAction
      if (action !== 'increase' && action !== 'decrease' && action !== 'remove')
        return
      actions.changeCart(Number(button.dataset.productId), action)
    }
  })
  $('#details-close').addEventListener('click', closeDetails)
  $('#details-backdrop').addEventListener('click', closeDetails)
  $('#details-add-to-cart').addEventListener('click', () => {
    closeDetails()
    if (detailsProduct) actions.addToCart(detailsProduct.id)
  })
  $('#proceed-to-checkout').addEventListener('click', actions.checkout)
  $('#back-to-cart').addEventListener('click', () => showStorefront(true))
  $('#continue-browsing').addEventListener('click', () => {
    form('checkout-form').reset()
    showStorefront()
  })
  $('#checkout-form').addEventListener('input', clearErrors)
  $('#checkout-form').addEventListener('submit', (event) => {
    event.preventDefault()
    actions.placeOrder(customer())
  })
  form('registration-form').addEventListener('submit', (event) => {
    event.preventDefault()
    $('#form-status').textContent =
      'Your form passed validation. This is a demo; no account was created or information saved.'
    form('registration-form').reset()
  })
  form('registration-form').addEventListener('input', () => {
    $('#form-status').textContent = ''
  })
  document.addEventListener('keydown', (event) => {
    const modal = detailsModal.classList.contains('is-open')
      ? detailsModal
      : cartPanel.classList.contains('is-open')
        ? cartPanel
        : null
    if (!modal) return
    if (event.key === 'Escape') {
      if (modal === detailsModal) closeDetails()
      else closeCart()
      return
    }
    focusTrap(event, modal)
  })

  return {
    render({
      loadState,
      visibleProducts: products,
      cart,
      view,
      total,
    }: RenderData) {
      const categoryFilter = select('category-filter')
      if (
        loadState.status === 'success' &&
        categoryFilter.options.length === 1
      ) {
        for (const category of [
          ...new Set(loadState.products.map((product) => product.category)),
        ]) {
          categoryFilter.add(new Option(category, category))
        }
      }
      categoryFilter.value = view.category
      input('product-search').value = view.search
      const summary = $('#product-summary')
      summary.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'} • Total: ${currency.format(products.reduce((sum, product) => sum + product.price, 0))}`
      $('#no-results').hidden = products.length !== 0
      const renderModel = getProductsRenderModel(loadState, products)
      if (renderModel.status === 'products') {
        catalogStatus.replaceChildren()
        grid.replaceChildren(...renderModel.products.map(productCard))
      } else if (renderModel.status === 'loading') {
        grid.replaceChildren()
        renderCatalogMessage('Loading products…')
        summary.textContent = 'Loading products…'
        $('#no-results').hidden = true
      } else if (renderModel.status === 'error') {
        grid.replaceChildren()
        renderCatalogMessage(renderModel.message, true, renderModel.retryLabel)
        summary.textContent = ''
        $('#no-results').hidden = true
      } else if (renderModel.status === 'empty') {
        grid.replaceChildren()
        renderCatalogMessage('No products available.')
        summary.textContent = 'No products available.'
        $('#no-results').hidden = true
      } else {
        grid.replaceChildren()
        renderCatalogMessage('No matching products.')
        summary.textContent = 'No matching products.'
        $('#no-results').hidden = true
      }
      for (const button of document.querySelectorAll(
        '.product-controls button',
      )) {
        const active =
          button.id === 'show-all'
            ? !view.under30 && !view.sortDirection
            : button.id === 'under-30'
              ? view.under30
              : button.id === 'sort-price-asc'
                ? view.sortDirection === 'asc'
                : view.sortDirection === 'desc'
        button.classList.toggle('active', active)
        button.setAttribute('aria-pressed', String(active))
      }
      const items = cart
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      $('#cart-count').textContent = String(count)
      $('#cart-count').hidden = count === 0
      $('#cart-total').textContent = currency.format(total)
      $('#clear-cart').toggleAttribute('disabled', items.length === 0)
      $('#proceed-to-checkout').toggleAttribute('disabled', items.length === 0)
      $('#cart-status').textContent = items.length
        ? `${count} ${count === 1 ? 'item' : 'items'} in your cart.`
        : 'Your cart is empty.'
      $('#cart-items').innerHTML = items.length
        ? items
            .map(
              ({ product, quantity }) =>
                `<article class="cart-item"><div class="cart-item-details"><h3>${product.name}</h3><p>${currency.format(product.price)} each</p></div><p class="cart-line-total">${currency.format(product.price * quantity)}</p><div class="quantity-controls" aria-label="Quantity for ${product.name}"><button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease quantity of ${product.name}">−</button><span aria-live="polite">${quantity}</span><button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase quantity of ${product.name}">+</button></div><button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}">Remove</button></article>`,
            )
            .join('')
        : '<p class="empty-cart">Your cart is waiting for a good find.</p>'
    },
    openCart,
    openDetails,
    showCheckout,
    showErrors,
    clearErrors,
    confirm(order: Order, cartCleared: boolean) {
      $('#checkout-form-view').hidden = true
      $('#order-confirmation').hidden = false
      $('#confirmation-message').textContent = cartCleared
        ? 'Your demo order was saved in this browser. No payment was taken and nothing was sent to a server.'
        : 'Your demo order was saved in this browser. Your cart was kept because it could not be updated locally.'
      $('#confirmation-order-id').textContent = order.id
      renderOrderItems($('#confirmation-items'), order.items)
      $('#confirmation-total').textContent = currency.format(order.total)
      $('#order-confirmation').focus()
    },
  }
}
