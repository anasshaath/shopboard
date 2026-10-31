const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function createUi(actions) {
  const $ = (selector) => document.querySelector(selector)
  const grid = $('#product-grid')
  const artwork = {
    1: [
      'sage',
      '<span class="tag">DESK ESSENTIAL</span><div class="notebook"><span>NOTES<br>&amp; IDEAS</span></div>',
    ],
    2: ['peach', '<div class="mug"></div>'],
    3: ['lavender', '<div class="lamp"><i></i><b></b></div>'],
    4: ['butter', '<div class="tote"><span>take<br>it easy.</span></div>'],
    5: ['rose', '<div class="bottle"><i></i></div>'],
    6: [
      'blue',
      '<span class="tag">A MOMENT OF CALM</span><div class="planter"><i></i><b></b><span></span></div>',
    ],
    7: ['sky', '<div class="sneaker"><i></i><b></b></div>'],
    8: ['oat', '<div class="loafer"><i></i></div>'],
    9: ['olive', '<div class="runner"><i></i><b></b></div>'],
    10: ['coral', '<div class="sandal"><i></i><b></b></div>'],
    11: ['stone', '<div class="tote"><span>market<br>day.</span></div>'],
    12: ['plum', '<div class="crossbody"><i></i><b></b></div>'],
  }
  const createArtwork = (productId) => {
    const [color, markup] = artwork[productId]
    const art = document.createElement('div')
    art.className = `product-art ${color}`
    art.setAttribute('aria-hidden', 'true')
    art.innerHTML = markup
    return art
  }
  const cartPanel = $('#shopping-cart')
  const detailsModal = $('#product-details')
  const checkout = $('#checkout')
  const main = $('main')
  const footer = $('footer')
  let lastFocus
  let detailsProduct

  const productCard = (product) => {
    const card = document.createElement('article')
    card.className = 'product'
    card.tabIndex = 0
    card.dataset.productId = product.id
    card.append(createArtwork(product.id))
    card.insertAdjacentHTML(
      'beforeend',
      `<div class="product-info"><div><p class="category">${product.category}</p><h3>${product.name}</h3></div><p class="price">${currency.format(product.price)}</p></div><p class="description">${product.description}</p><button class="add-to-cart" type="button" data-add-to-cart="${product.id}">Add to cart</button><button class="view-details" type="button" data-view-details="${product.id}">View details</button>`,
    )
    return card
  }

  function focusTrap(event, modal) {
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
      last.focus()
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function closeCart() {
    cartPanel.classList.remove('is-open')
    cartPanel.setAttribute('aria-hidden', 'true')
    $('#cart-toggle').setAttribute('aria-expanded', 'false')
    $('#cart-backdrop').hidden = true
    document.body.classList.remove('cart-open')
    lastFocus?.focus()
  }

  function openCart() {
    lastFocus = document.activeElement
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
    lastFocus?.focus()
  }

  function openDetails(product) {
    detailsProduct = product
    lastFocus = document.activeElement
    $('#details-art').replaceChildren(createArtwork(product.id))
    $('#details-category').textContent = product.category
    $('#details-title').textContent = product.name
    $('#details-price').textContent = currency.format(product.price)
    $('#details-description').textContent = product.description
    $('#details-backdrop').hidden = false
    detailsModal.classList.add('is-open')
    detailsModal.setAttribute('aria-hidden', 'false')
    document.body.classList.add('details-open')
    $('#details-close').focus()
  }

  function renderOrderItems(container, items) {
    container.innerHTML = items
      .map((item) => {
        const product = item.product ?? item
        return `<div class="checkout-item"><div><h3>${product.name}</h3><p>${item.quantity} × ${currency.format(product.price)}</p></div><strong>${currency.format(product.price * item.quantity)}</strong></div>`
      })
      .join('')
  }

  function showCheckout(items, total) {
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

  function customer() {
    return Object.fromEntries(new FormData($('#checkout-form')))
  }

  function showErrors(errors, general = '') {
    const form = $('#checkout-form')
    form.querySelectorAll('.field-error').forEach((element) => {
      element.textContent = ''
    })
    form
      .querySelectorAll('input')
      .forEach((input) => input.removeAttribute('aria-invalid'))
    Object.entries(errors).forEach(([name, message]) => {
      const id = name === 'fullName' ? 'name' : name
      const input = form.elements[name]
      input.setAttribute('aria-invalid', 'true')
      $(`#checkout-${id}-error`).textContent = message
    })
    const error = $('#checkout-error')
    error.textContent = general
    error.hidden = !general
    const first = form.querySelector('[aria-invalid="true"]')
    if (first) first.focus()
  }

  function clearErrors() {
    showErrors({}, '')
  }

  grid.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add-to-cart]')
    const detail = event.target.closest('[data-view-details]')
    if (add) actions.addToCart(Number(add.dataset.addToCart))
    else if (detail) actions.showDetails(Number(detail.dataset.viewDetails))
    else if (event.target.closest('.product'))
      actions.showDetails(
        Number(event.target.closest('.product').dataset.productId),
      )
  })
  grid.addEventListener('keydown', (event) => {
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      event.target.matches('.product')
    ) {
      event.preventDefault()
      actions.showDetails(Number(event.target.dataset.productId))
    }
  })
  $('#product-search').addEventListener('input', (event) =>
    actions.search(event.target.value),
  )
  $('#category-filter').addEventListener('change', (event) =>
    actions.filterCategory(event.target.value),
  )
  $('.product-controls').addEventListener('click', (event) => {
    const button = event.target.closest('button')
    if (button) actions.changeView(button.id)
  })
  $('#cart-toggle').addEventListener('click', openCart)
  $('#cart-close').addEventListener('click', closeCart)
  $('#continue-shopping').addEventListener('click', closeCart)
  $('#cart-backdrop').addEventListener('click', closeCart)
  $('#clear-cart').addEventListener('click', actions.clearCart)
  $('#cart-items').addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]')
    if (button)
      actions.changeCart(
        Number(button.dataset.productId),
        button.dataset.cartAction,
      )
  })
  $('#details-close').addEventListener('click', closeDetails)
  $('#details-backdrop').addEventListener('click', closeDetails)
  $('#details-add-to-cart').addEventListener('click', () => {
    closeDetails()
    actions.addToCart(detailsProduct.id)
  })
  $('#proceed-to-checkout').addEventListener('click', actions.checkout)
  $('#back-to-cart').addEventListener('click', () => showStorefront(true))
  $('#continue-browsing').addEventListener('click', () => {
    $('#checkout-form').reset()
    showStorefront()
  })
  $('#checkout-form').addEventListener('input', clearErrors)
  $('#checkout-form').addEventListener('submit', (event) => {
    event.preventDefault()
    actions.placeOrder(customer())
  })
  $('#registration-form').addEventListener('submit', (event) => {
    event.preventDefault()
    $('#form-status').textContent =
      'Your form passed validation. This is a demo; no account was created or information saved.'
    event.currentTarget.reset()
  })
  $('#registration-form').addEventListener('input', () => {
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
    render({ products, cart, view, total }) {
      const categoryFilter = $('#category-filter')
      if (categoryFilter.options.length === 1) {
        for (const category of [
          ...new Set(products.map((product) => product.category)),
        ]) {
          categoryFilter.add(new Option(category, category))
        }
      }
      categoryFilter.value = view.category
      $('#product-search').value = view.search
      grid.replaceChildren(...products.map(productCard))
      const summary = $('#product-summary')
      summary.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'} • Total: ${currency.format(products.reduce((sum, product) => sum + product.price, 0))}`
      $('#no-results').hidden = products.length !== 0
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
      $('#cart-count').textContent = count
      $('#cart-count').hidden = count === 0
      $('#cart-total').textContent = currency.format(total)
      $('#clear-cart').disabled = items.length === 0
      $('#proceed-to-checkout').disabled = items.length === 0
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
    confirm(order, cartCleared) {
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
