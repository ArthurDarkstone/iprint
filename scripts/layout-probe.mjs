import { chromium } from 'playwright'

const url = 'http://localhost:1420/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(2000)

const layout = await page.evaluate(() => {
  function box(sel) {
    const el = document.querySelector(sel)
    if (!el) return { sel, missing: true }
    const r = el.getBoundingClientRect()
    return { sel, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }
  // The default layout: toolbar top; then a row with picker | container | control
  // Find panels by role
  const panels = Array.from(document.querySelectorAll('[data-slot="resizable-panel"], .reka-splitter-panel')).map((el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  })
  const paper = document.querySelector('.hiprint-printPaper')
  const pr = paper ? paper.getBoundingClientRect() : null
  const designHost = document.querySelector('.hiprint-printTemplate')
  const dh = designHost ? designHost.getBoundingClientRect() : null
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    toolbar: box('.w-full.h-12'),
    picker: box('.overflow-y-scroll, [class*="border-r"]'),
    controlPanel: box('#PrintElementOptionSetting'),
    resizablePanels: panels,
    paper: pr ? { x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height) } : null,
    designHost: dh ? { x: Math.round(dh.x), y: Math.round(dh.y), w: Math.round(dh.width), h: Math.round(dh.height) } : null,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }
})

console.log(JSON.stringify(layout, null, 2))

await browser.close()
