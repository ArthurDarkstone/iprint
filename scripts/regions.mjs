import { chromium } from 'playwright'
import fs from 'node:fs'

const url = 'http://localhost:1420/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(2000)

// Crop regions
const middle = { x: 289, y: 48, width: 863, height: 852 }
await page.screenshot({ path: 'scripts/shot-middle.png', clip: middle })
const left = { x: 0, y: 48, width: 288, height: 852 }
await page.screenshot({ path: 'scripts/shot-left.png', clip: left })

// Analyze: is the paper visible (white) in the middle? Sample center pixel + check picker item count.
const analysis = await page.evaluate(() => {
  const paper = document.querySelector('.hiprint-printPaper')
  const cs = paper ? getComputedStyle(paper) : null
  const pickerItems = document.querySelectorAll('.ep-draggable-item')
  const itemTexts = Array.from(pickerItems).map(a => a.textContent?.trim())
  // middle panel scroll info
  const middlePanel = document.querySelector('[data-slot="resizable-panel"]')
  // find the container scroll element
  const scrollEl = document.querySelector('.overflow-auto')
  return {
    paperBg: cs?.backgroundColor,
    paperDisplay: cs?.display,
    paperVisibility: cs?.visibility,
    pickerItemCount: pickerItems.length,
    pickerItemTexts: itemTexts,
    middleScrollClientH: scrollEl ? scrollEl.clientHeight : null,
    middleScrollH: scrollEl ? scrollEl.scrollHeight : null,
    middleScrollW: scrollEl ? scrollEl.scrollWidth : null,
  }
})
console.log(JSON.stringify(analysis, null, 2))

// Also dump full visible text outline of middle
const outline = await page.evaluate(() => {
  const mid = document.querySelectorAll('.hiprint-printPaper *')
  return mid.length
})
console.log('paper descendant count:', outline)

await browser.close()
