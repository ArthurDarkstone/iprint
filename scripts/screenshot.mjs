import { chromium } from 'playwright'

const url = 'http://localhost:1420/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const consoleLogs = []
const errors = []
page.on('console', (msg) => {
  consoleLogs.push(`[${msg.type()}] ${msg.text()}`)
})
page.on('pageerror', (err) => {
  errors.push(`PAGEERROR: ${err.message}\n${err.stack || ''}`)
})

await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('goto warn:', e.message))
await page.waitForTimeout(2500)

await page.screenshot({ path: 'scripts/shot-full.png', fullPage: true })
await page.screenshot({ path: 'scripts/shot-view.png' })

// Dump some structural info about the middle container
const info = await page.evaluate(() => {
  const pick = document.querySelector('#PrintElementOptionSetting') // right panel
  const host = document.querySelector('.hiprint-printTemplate, [ref="designHost"], #designHost')
  const designHost = document.querySelector('[ref="designHost"]') || document.querySelector('.hiprint-printTemplate')
  const panels = document.querySelectorAll('.hiprint-printPanel, .hiprint-printPaper')
  const bodyHtml = document.body.innerHTML.length
  const toolbar = document.querySelector('.hiprint-toolbar')
  return {
    designHostFound: !!designHost,
    designHostHtml: designHost ? designHost.outerHTML.slice(0, 500) : null,
    panelCount: panels.length,
    bodyLen: bodyHtml,
    settingHostFound: !!pick,
    toolbarFound: !!toolbar,
  }
})

console.log('--- INFO ---')
console.log(JSON.stringify(info, null, 2))
console.log('--- CONSOLE (' + consoleLogs.length + ') ---')
consoleLogs.slice(-40).forEach(l => console.log(l))
console.log('--- ERRORS (' + errors.length + ') ---')
errors.forEach(e => console.log(e))

await browser.close()
