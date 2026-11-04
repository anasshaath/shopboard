const assert = require('node:assert/strict')
const { chromium } = require('playwright')

const appUrl = 'http://127.0.0.1:5173/'
const maliciousName =
  '<img data-malicious-product src="/does-not-exist" onerror="window.productNameScriptRan = true">'

async function main() {
  const browser = await chromium.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.addInitScript(() => {
    window.productNameScriptRan = false
  })
  await page.route('https://shopboard-api.vercel.app/api/products', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 1,
            title: maliciousName,
            category_name: 'Bags',
            price_cents: 8900,
            in_stock: true,
          },
          {
            id: 2,
            title: 'Unavailable sample',
            category_name: 'Shoes',
            price_cents: 6400,
            in_stock: false,
          },
        ],
        total: 2,
      }),
    }),
  )

  try {
    await page.goto(appUrl, { waitUntil: 'networkidle' })
    await page.locator('.product h3').first().waitFor()
    assert.equal(await page.locator('[data-malicious-product]').count(), 0)
    assert.equal(
      await page.locator('.product h3').first().textContent(),
      maliciousName,
    )
    assert.equal(await page.evaluate(() => window.productNameScriptRan), false)
    assert.equal(
      await page.locator('[data-add-to-cart="2"]').isDisabled(),
      true,
    )

    await page.locator('[data-add-to-cart="1"]').click()
    assert.equal(await page.locator('[data-malicious-product]').count(), 0)
    assert.equal(
      await page.locator('#cart-items h3').textContent(),
      maliciousName,
    )
    assert.equal(await page.evaluate(() => window.productNameScriptRan), false)

    await page.locator('#proceed-to-checkout').click()
    assert.equal(await page.locator('[data-malicious-product]').count(), 0)
    assert.equal(
      await page.locator('#checkout-items h3').textContent(),
      maliciousName,
    )
    assert.equal(await page.evaluate(() => window.productNameScriptRan), false)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
