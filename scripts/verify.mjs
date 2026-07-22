import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => m.type() === 'error' && errors.push(`[console] ${m.text()}`))

await page.goto('http://localhost:1420/', { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(2000)

// Paper width before
const before = await page.evaluate(() => {
  const p = document.querySelector('.hiprint-printPaper')
  return p ? p.getBoundingClientRect().width : null
})

// Click the A5 toolbar button
const clicked = await page.getByText('A5', { exact: true }).first().click({ timeout: 5000 }).then(() => true).catch(() => false)
await page.waitForTimeout(500)

const after = await page.evaluate(() => {
  const p = document.querySelector('.hiprint-printPaper')
  return p ? { w: p.getBoundingClientRect().width, style: p.getAttribute('style') } : null
})

console.log('paper width before A5:', before)
console.log('A5 clicked:', clicked)
console.log('paper after A5:', JSON.stringify(after))

// Errors
console.log('errors:', errors.length)
errors.forEach(e => console.log('  -', e))

await page.screenshot({ path: 'scripts/shot-final.png' })
await browser.close()
