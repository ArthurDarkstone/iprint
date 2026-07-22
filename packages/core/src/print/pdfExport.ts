import type { PrintTemplate } from '../template/PrintTemplate'
import type { PrintData } from '../types'
import { mm, pt } from '../utils/units'

/**
 * PDF export via jsPDF + html2canvas + canvg. Mirrors hiprint's PrintTemplate.toPdf.
 * Implemented in Phase 6.
 */
export async function toPdf(template: PrintTemplate, data: PrintData, filename: string, options?: any): Promise<void> {
  const [{ default: JsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  const panel = template.getPanel(0)
  if (!panel)
    return
  const widthPt = mm.toPt(panel.width)
  const heightPt = mm.toPt(panel.height)
  const orientation = panel.height >= panel.width ? 'p' : 'l'
  const doc = new JsPDF({
    orientation,
    unit: 'pt',
    format: panel.paperType ? panel.paperType.toLowerCase() : [widthPt, heightPt],
  })
  const html = template.getHtml(data, { ...options, imgToBase64: true })
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.appendChild((html as any).els?.[0] || document.createElement('div'))
  document.body.appendChild(container)

  await svgToCanvas(container)

  const canvas = await html2canvas(container, {
    scale: 2,
    width: pt.toPx(widthPt),
    useCORS: true,
    ...options,
  })
  const imgData = canvas.toDataURL('image/jpeg')

  const pages = container.querySelectorAll('.hiprint-printPanel .hiprint-printPaper')
  if (pages.length === 0) {
    doc.addImage(imgData, 'JPEG', 0, 0, widthPt, heightPt)
  }
  else {
    pages.forEach((_page, i) => {
      if (i > 0)
        doc.addPage()
      doc.addImage(imgData, 'JPEG', 0, -i * heightPt, widthPt, heightPt * pages.length)
    })
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  container.remove()
}

async function svgToCanvas(container: HTMLElement): Promise<void> {
  const Canvg = (await import('canvg')).default as any
  const svgs = Array.from(container.querySelectorAll('svg'))
  for (const svg of svgs) {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const canvg = await Canvg.fromString(ctx, source)
      await canvg.render()
    }
    svg.parentNode?.replaceChild(canvas, svg)
  }
}
