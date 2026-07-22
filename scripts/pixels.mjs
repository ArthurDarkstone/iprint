import { chromium } from 'playwright'
import sharp from 'sharp'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:1420/', { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(2500)

const buf = await page.screenshot({ path: 'scripts/shot-view2.png' })
const { data, info } = await sharp(buf).flatten({ background: '#fff' }).raw().ensureAlpha().toBuffer({ resolveWithObject: true })

function px(x, y) {
  const i = (y * info.width + x) * 4
  return [data[i], data[i + 1], data[i + 2]]
}
const pts = [
  [50, 200, 'picker area'],
  [400, 200, 'middle top-left'],
  [700, 200, 'middle center'],
  [700, 500, 'middle mid'],
  [700, 850, 'middle bottom'],
  [1000, 200, 'middle right'],
  [1200, 200, 'control panel'],
  [700, 60, 'toolbar'],
]
for (const [x, y, label] of pts)
  console.log(`${label} (${x},${y}): rgb(${px(x, y).join(',')})`)

// Also: is there a .hiprint-printPaper visible in viewport? get its rect in viewport coords
const vis = await page.evaluate(() => {
  const p = document.querySelector('.hiprint-printPaper')
  if (!p) return null
  const r = p.getBoundingClientRect()
  const scrollEl = document.querySelector('.overflow-auto')
  return {
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    inViewportTop: r.top < window.innerHeight,
    scrollElRect: scrollEl ? scrollEl.getBoundingClientRect() : null,
    scrollElScrollTop: scrollEl ? scrollEl.scrollTop : null,
    scrollElClientH: scrollEl ? scrollEl.clientHeight : null,
  }
})
console.log('paper viz:', JSON.stringify(vis, null, 2))

await browser.close()
