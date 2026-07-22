import type { Dom } from '../utils/dom'

/**
 * Browser print via hidden iframe, mirroring $.fn.hiwprint.
 * Collects print stylesheets, waits for images, then triggers print.
 */
export function hiwprint(target: Dom, options: { importCss?: boolean, printContainer?: boolean } = {}): void {
  const { importCss = true, printContainer = true } = options
  document.getElementById('hiwprint_iframe')?.remove()
  const iframe = document.createElement('iframe')
  iframe.id = 'hiwprint_iframe'
  iframe.style.cssText = 'visibility:hidden;height:0;width:0;position:absolute'
  document.body.appendChild(iframe)

  let css = ''
  if (importCss) {
    let printLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[media="print"]'))
    if (printLinks.length === 0)
      printLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    css = printLinks.map(l => l.outerHTML).join('\n')
    const styles = Array.from(document.querySelectorAll('style'))
    css += styles.map(s => `<style>${s.textContent}</style>`).join('\n')
  }

  const doc = iframe.contentWindow?.document
  if (!doc)
    return
  doc.open()
  doc.write(`<!DOCTYPE html><html><head>${css}</head><body></body></html>`)
  doc.close()

  iframe.onload = () => {
    const body = doc.body
    const el = (target as any).els?.[0] as HTMLElement | undefined
    if (el) {
      body.innerHTML = printContainer ? el.outerHTML : el.innerHTML
    }
    loadAllImages(doc, () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    })
  }
}

function loadAllImages(doc: Document, callback: () => void, attempts = 0): void {
  const imgs = Array.from(doc.querySelectorAll('img'))
  const allLoaded = imgs.every(img => img.complete)
  if (allLoaded || attempts >= 10) {
    callback()
    return
  }
  setTimeout(() => loadAllImages(doc, callback, attempts + 1), 500)
}
