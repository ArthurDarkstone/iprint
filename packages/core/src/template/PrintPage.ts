import type { PrintData } from '../types'
import type { Dom } from '../utils/dom'
import { dom } from '../utils/dom'
import { event } from '../utils/event'
import { mm, px } from '../utils/units'

export interface PaperBaseInfo {
  paperHeader?: number
  paperFooter?: number
  paperNumberLeft?: number
  paperNumberTop?: number
  paperNumberDisabled?: boolean
  paperNumberFormat?: string
}

/**
 * A single paper page (design or print). Mirrors hiprint's PrintPage / PrintPaper.
 */
export class PrintPage {
  index: number
  width: number
  height: number
  paperHeader: number
  paperFooter: number
  paperNumberLeft?: number
  paperNumberTop?: number
  paperNumberDisabled?: boolean
  paperNumberFormat?: string
  panel: any
  target: Dom
  content: Dom
  printLine = 0
  referenceElement: any
  rotate?: boolean

  constructor(panel: any, index: number) {
    this.panel = panel
    this.index = index
    this.width = panel.width
    this.height = panel.height
    this.paperHeader = panel.paperHeader || 0
    this.paperFooter = panel.paperFooter ?? mm.toPt(panel.height)
    this.paperNumberLeft = panel.paperNumberLeft
    this.paperNumberTop = panel.paperNumberTop
    this.paperNumberDisabled = panel.paperNumberDisabled
    this.paperNumberFormat = panel.paperNumberFormat
    this.rotate = panel.rotate
    this.target = this.createTarget()
  }

  createTarget(): Dom {
    const paper = dom('<div class="hiprint-printPaper"></div>')
    paper.css({
      width: `${this.width}mm`,
      height: `${this.height - (this.panel?.paperHeightTrim || 0)}mm`,
      position: 'relative',
      overflow: 'hidden',
    })
    paper.attr('original-height', String(this.height))
    this.content = dom('<div class="hiprint-printPaper-content"></div>')
    paper.append(this.content)
    return paper
  }

  getTarget(): Dom {
    return this.target
  }

  append(target: Dom): void {
    this.content.append(target)
  }

  design(_options?: any): void {
    this.target.addClass('design')
    this.createHeaderLine()
    this.createFooterLine()
    this.createPaperNumber()
    this.createRuler()
  }

  createHeaderLine(): Dom {
    const line = dom('<div class="hiprint-headerLine"></div>')
    line.css({
      'position': 'absolute',
      'top': `${this.paperHeader}pt`,
      'left': 0,
      'width': '100%',
      'border-top': '1px dashed #cebcbc',
      'cursor': 'ns-resize',
    })
    if (this.paperHeader === 0)
      line.hide()
    const node = line.get(0)!
    let startY = 0
    let startTop = 0
    node.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      startY = e.clientY
      startTop = this.paperHeader
      const onMove = (ev: MouseEvent) => {
        const top = Math.max(0, startTop + px.toPt(ev.clientY - startY))
        this.paperHeader = top
        line.css('top', `${top}pt`)
        event.trigger(`paperBaseInfoChanged_${this.panel?.templateId}`, { paperHeader: top })
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    })
    this.target.append(line)
    return line
  }

  createFooterLine(): Dom {
    const line = dom('<div class="hiprint-footerLine"></div>')
    line.css({
      'position': 'absolute',
      'top': `${this.paperFooter}pt`,
      'left': 0,
      'width': '100%',
      'border-top': '1px dashed #cebcbc',
      'cursor': 'ns-resize',
    })
    if (this.paperFooter === this.height || this.paperFooter === mm.toPt(this.height))
      line.hide()
    const node = line.get(0)!
    let startY = 0
    let startTop = 0
    node.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      startY = e.clientY
      startTop = this.paperFooter
      const onMove = (ev: MouseEvent) => {
        const top = Math.max(0, startTop + px.toPt(ev.clientY - startY))
        this.paperFooter = top
        line.css('top', `${top}pt`)
        event.trigger(`paperBaseInfoChanged_${this.panel?.templateId}`, { paperFooter: top })
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    })
    this.target.append(line)
    return line
  }

  createPaperNumber(): Dom {
    const span = dom('<span class="hiprint-paperNumber"></span>')
    span.css({
      'position': 'absolute',
      'left': `${this.paperNumberLeft || 0}pt`,
      'top': `${this.paperNumberTop || 0}pt`,
      'font-size': '9pt',
      'cursor': 'pointer',
    })
    if (this.paperNumberDisabled)
      span.addClass('hiprint-paperNumber-disabled')
    const node = span.get(0)!
    node.addEventListener('dblclick', (e: MouseEvent) => {
      e.stopPropagation()
      this.paperNumberDisabled = !this.paperNumberDisabled
      span.toggleClass('hiprint-paperNumber-disabled', this.paperNumberDisabled)
      event.trigger(`paperBaseInfoChanged_${this.panel?.templateId}`, { paperNumberDisabled: this.paperNumberDisabled })
    })
    this.target.append(span)
    return span
  }

  createRuler(): void {
    // Ruler rendered as part of design view; left as a no-op hook for Phase 3.
  }

  updatePaperNumber(current: number, total: number, paperNumberToggleInEven?: boolean): void {
    if (this.paperNumberDisabled)
      return
    const format = this.paperNumberFormat || 'paperNo-paperCount'
    const text = format.replace(/paperNo/g, String(current)).replace(/paperCount/g, String(total))
    const span = this.target.find('.hiprint-paperNumber')
    span.text(text)
    if (paperNumberToggleInEven && current % 2 === 0)
      span.css('right', `${this.paperNumberLeft || 0}pt`).css('left', 'auto')
  }

  updatePrintLine(printLine: number): void {
    if (printLine != null && printLine > this.printLine)
      this.printLine = printLine
  }

  updateReferenceElement(ref: any): void {
    this.referenceElement = ref
  }

  getContentHeight(pageIndex: number): number {
    void pageIndex
    return this.paperFooter - this.paperHeader
  }

  getPaperFooter(pageIndex: number): number {
    void pageIndex
    return this.paperFooter
  }

  setOffset(left: number, top: number): void {
    if (left != null)
      this.content.css('margin-left', `${left}pt`)
    if (top != null)
      this.content.css('margin-top', `${top}pt`)
  }

  setLeftOffset(left: number): void {
    if (left != null)
      this.content.css('margin-left', `${left}pt`)
  }

  setTopOffset(top: number): void {
    if (top != null)
      this.content.css('margin-top', `${top}pt`)
  }

  subscribePaperBaseInfoChanged(cb: (info: PaperBaseInfo) => void): void {
    event.on(`paperBaseInfoChanged_${this.panel?.templateId}`, cb as any)
  }
}

export type { PrintData }
