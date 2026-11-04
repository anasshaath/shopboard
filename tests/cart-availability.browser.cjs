const assert = require('node:assert/strict')
const { chromium } = require('playwright')

const appUrl = 'http://127.0.0.1:5173/'
const product = {
  id: 1,
  title: 'Leather Tote Bag',
  category_name: 'Bags',
  price_cents: 8900,
  in_stock: true,
}

async function createPage(browser, savedCart, request) {
  const context = await browser.newContext()
  await context.addInitScript((cart) => {
    localStorage.setItem('shopboard-cart', cart)
  }, savedCart)
  const page = await context.newPage()
  await page.route('https://shopboard-api.vercel.app/api/products', request)
  return { context, page }
}

async function openCart(page) {
  await page.locator('#cart-toggle').click()
}

async function main() {
  const browser = await chromium.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })
  try {
    let response = 'empty'
    const emptyScenario = await createPage(
      browser,
      '[{"id":1,"quantity":2}]',
      (route) => {
        if (response === 'empty') {
          return route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ items: [], total: 0 }),
          })
        }
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ items: [product], total: 1 }),
        })
      },
    )
    try {
      await emptyScenario.page.goto(appUrl, { waitUntil: 'networkidle' })
      await openCart(emptyScenario.page)
      assert.match(
        await emptyScenario.page.locator('#cart-status').textContent(),
        /saved cart is safe/i,
      )
      assert.equal(
        await emptyScenario.page.locator('#proceed-to-checkout').isDisabled(),
        true,
      )
      assert.equal(
        await emptyScenario.page.evaluate(() =>
          localStorage.getItem('shopboard-cart'),
        ),
        '[{"id":1,"quantity":2}]',
      )

      response = 'success'
      await emptyScenario.page.reload({ waitUntil: 'networkidle' })
      await openCart(emptyScenario.page)
      assert.equal(
        await emptyScenario.page.locator('#cart-items h3').count(),
        1,
      )
      assert.equal(
        await emptyScenario.page.locator('#proceed-to-checkout').isDisabled(),
        false,
      )
    } finally {
      await emptyScenario.context.close()
    }

    let failThenSucceed = true
    const failureScenario = await createPage(
      browser,
      '[{"id":1,"quantity":1}]',
      (route) => {
        if (failThenSucceed) return route.abort('failed')
        return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ items: [product], total: 1 }),
        })
      },
    )
    try {
      await failureScenario.page.goto(appUrl, { waitUntil: 'networkidle' })
      await failureScenario.page
        .getByRole('button', { name: 'Try again' })
        .waitFor()
      await openCart(failureScenario.page)
      assert.match(
        await failureScenario.page.locator('#cart-status').textContent(),
        /saved cart is safe/i,
      )
      assert.equal(
        await failureScenario.page.evaluate(() =>
          localStorage.getItem('shopboard-cart'),
        ),
        '[{"id":1,"quantity":1}]',
      )
      await failureScenario.page
        .getByRole('button', { name: 'Close cart' })
        .click()
      failThenSucceed = false
      await failureScenario.page
        .getByRole('button', { name: 'Try again' })
        .click()
      await failureScenario.page.locator('.product h3').waitFor()
      await openCart(failureScenario.page)
      assert.equal(
        await failureScenario.page.locator('#proceed-to-checkout').isDisabled(),
        false,
      )
    } finally {
      await failureScenario.context.close()
    }

    const removedScenario = await createPage(
      browser,
      '[{"id":999,"quantity":1}]',
      (route) =>
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ items: [product], total: 1 }),
        }),
    )
    try {
      await removedScenario.page.goto(appUrl, { waitUntil: 'networkidle' })
      await openCart(removedScenario.page)
      assert.match(
        await removedScenario.page.locator('#cart-status').textContent(),
        /no longer available/i,
      )
      assert.equal(
        await removedScenario.page.evaluate(() =>
          localStorage.getItem('shopboard-cart'),
        ),
        '[{"id":999,"quantity":1}]',
      )
      await removedScenario.page
        .getByRole('button', { name: 'Remove unavailable item' })
        .click()
      assert.equal(
        await removedScenario.page.evaluate(() =>
          localStorage.getItem('shopboard-cart'),
        ),
        '[]',
      )
    } finally {
      await removedScenario.context.close()
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
