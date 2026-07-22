import type { PrintElementType } from '../elements/PrintElementType'
import type { DesignOptions, GetHtmlOptions, PrintData, PrintElement, PrintPanelEntity } from '../types'
import type { Dom } from '../utils/dom'
import { config } from '../config'
import { getPaperSize } from '../config/paperSizes'
import { makeDroppable } from '../drag/draggable'
import { createPrintElementType } from '../elements/PrintElementType'
import { dom } from '../utils/dom'
import { event } from '../utils/event'
import { hiPrintlib } from '../utils/hiprintlib'
import { mm, px } from '../utils/units'
import { PrintPage } from './PrintPage'

/**
 * A print panel: a paper size + a set of print elements.
 * Mirrors hiprint's PrintPanel (class pt).
 */
export class PrintPanel {
  templateId: string
  index: number
  width: number
  height: number
  paperType?: string
  paperHeader: number
  paperFooter: number
  paperNumberLeft?: number
  paperNumberTop?: number
  paperNumberDisabled?: boolean
  paperNumberFormat?: string
  panelPaperRule?: 'odd' | 'even'
  rotate?: boolean
  firstPaperFooter?: number
  evenPaperFooter?: number
  oddPaperFooter?: number
  lastPaperFooter?: number
  topOffset?: number
  leftOffset?: number
  fontFamily?: string
  orient?: 1 | 2
  printElements: any[] = []
  mouseRectSelectedElement: any[] = []
  target: Dom
  designPaper?: PrintPage

  constructor(panel: PrintPanelEntity, templateId: string) {
    this.templateId = templateId
    this.index = panel.index ?? 0
    this.paperType = panel.paperType
    if (this.paperType) {
      const size = getPaperSize(this.paperType)
      if (panel.height) {
        this.height = panel.height
        this.width = panel.width
      }
      else if (size) {
        this.height = size.height
        this.width = size.width
      }
    }
    else {
      this.height = panel.height
      this.width = panel.width
    }
    this.paperHeader = panel.paperHeader || 0
    this.paperFooter = panel.paperFooter ?? mm.toPt(this.height)
    this.paperNumberLeft = panel.paperNumberLeft
    this.paperNumberTop = panel.paperNumberTop
    this.paperNumberDisabled = panel.paperNumberDisabled
    this.paperNumberFormat = panel.paperNumberFormat
    this.panelPaperRule = panel.panelPaperRule
    this.rotate = panel.rotate
    this.firstPaperFooter = panel.firstPaperFooter
    this.evenPaperFooter = panel.evenPaperFooter
    this.oddPaperFooter = panel.oddPaperFooter
    this.lastPaperFooter = panel.lastPaperFooter
    this.topOffset = panel.topOffset
    this.leftOffset = panel.leftOffset
    this.fontFamily = panel.fontFamily
    this.orient = panel.orient
    this.initPrintElements(panel.printElements)
    this.target = this.createTarget()
  }

  static createDefaultPanel(_templateId: string): PrintPanelEntity {
    return {
      index: 0,
      width: 210,
      height: 297,
      paperHeader: 0,
      paperFooter: mm.toPt(297),
      printElements: [],
    } as PrintPanelEntity
  }

  initPrintElements(elements: PrintElement[] = []): void {
    this.printElements = elements.map((el) => {
      let type: PrintElementType
      if ((el as any).tid) {
        type = createPrintElementType({
          tid: (el as any).tid,
          title: el.printElementType?.title || '',
          type: el.printElementType?.type as any,
          ...el.printElementType,
        })
      }
      else {
        type = createPrintElementType({
          tid: '',
          title: el.printElementType?.title || '',
          type: el.printElementType?.type as any,
          ...el.printElementType,
        })
      }
      const printElement = type.createPrintElement(el.options)
      printElement.setTemplateId(this.templateId)
      printElement.setPanel(this)
      return printElement
    })
  }

  createTarget(): Dom {
    const panel = dom('<div class="hiprint-printPanel"></div>')
    panel.addClass(`panel-index-${this.index}`)
    return panel
  }

  getTarget(): Dom {
    return this.target
  }

  css(target: Dom): void {
    if (this.fontFamily)
      target.css('font-family', this.fontFamily)
  }

  createNewPage(index: number, referenceElement?: any): PrintPage {
    const page = new PrintPage(this, index)
    if (referenceElement)
      page.referenceElement = referenceElement
    return page
  }

  orderPrintElements(): void {
    this.printElements.sort((a, b) => (a.options.top || 0) - (b.options.top || 0) || (a.options.left || 0) - (b.options.left || 0))
  }

  appendDesignPrintElement(paper: PrintPage, printElement: any): void {
    const target = printElement.getDesignTarget(paper.getTarget())
    paper.content.append(target)
  }

  design(options?: DesignOptions): void {
    this.orderPrintElements()
    this.designPaper = this.createNewPage(0)
    this.target.empty()
    this.target.append(this.designPaper.getTarget())
    this.designPaper.design(options)
    this.css(this.target)
    this.droppablePaper(this.designPaper)
    this.printElements.forEach((el) => {
      this.appendDesignPrintElement(this.designPaper!, el)
      el.design(options, this.designPaper?.getTarget())
    })
    this.target.on('click', () => {
      event.trigger(`BuildCustomOptionSettingEventKey_${this.templateId}`, {
        options: {
          panelPaperRule: this.panelPaperRule,
          firstPaperFooter: this.firstPaperFooter,
          evenPaperFooter: this.evenPaperFooter,
          oddPaperFooter: this.oddPaperFooter,
          lastPaperFooter: this.lastPaperFooter,
          leftOffset: this.leftOffset,
          topOffset: this.topOffset,
          fontFamily: this.fontFamily,
          orient: this.orient,
          paperNumberFormat: this.paperNumberFormat,
        },
        callback: (vals: any) => {
          this.panelPaperRule = vals.panelPaperRule
          this.firstPaperFooter = vals.firstPaperFooter
          this.evenPaperFooter = vals.evenPaperFooter
          this.oddPaperFooter = vals.oddPaperFooter
          this.lastPaperFooter = vals.lastPaperFooter
          this.leftOffset = vals.leftOffset
          this.topOffset = vals.topOffset
          this.fontFamily = vals.fontFamily
          this.orient = vals.orient
          this.paperNumberFormat = vals.paperNumberFormat
          this.designPaper?.setOffset(this.leftOffset || 0, this.topOffset || 0)
          this.css(this.target)
        },
      })
    })
    this.bindBatchMoveElement()
  }

  /**
   * Render HTML with multi-page pagination. Mirrors hiprint's PrintPanel.getHtml.
   * Non-fixed / non-header-footer elements are placed in order; an element that
   * returns multiple PaperHtmlResults (longText / table) spills onto new pages.
   * Fixed + header/footer elements repeat on every page (subject to showInPage).
   */
  getHtml(data?: PrintData, options?: GetHtmlOptions, pages?: PrintPage[], _self?: any, _extra?: any): Dom {
    this.orderPrintElements()
    const panelTarget = this.createTarget()
    const p: PrintPage[] = pages || []
    let l = p.length > 0 ? p[p.length - 1] : this.createNewPage(p.length)
    if (p.length === 0) {
      p.push(l)
      panelTarget.append(l.getTarget())
    }
    let ref = l.referenceElement || makeReference(this.paperHeader, 0, 0, 0, 0, p.length - 1, this.paperHeader, this.paperHeader)

    this.printElements
      .filter(el => !el.isFixed() && !el.isHeaderOrFooter())
      .forEach((el) => {
        const currentPage = p[ref.endPrintPaperIndex ?? ref.beginPrintPaperIndex] ?? p[p.length - 1]
        const results = el.getHtml(currentPage, data, options) || []
        results.forEach((r: any, i: number) => {
          if (r.referenceElement) {
            r.referenceElement.beginPrintPaperIndex = (currentPage?.index ?? p.length - 1)
            r.referenceElement.endPrintPaperIndex = (currentPage?.index ?? p.length - 1) + results.length - 1
          }
          if (i > 0) {
            l = this.createNewPage(p.length, ref)
            p.push(l)
            panelTarget.append(l.getTarget())
          }
          if (r.target) {
            l.append(r.target)
            l.updatePrintLine(r.printLine)
          }
          if (i === results.length - 1 && r.referenceElement)
            ref = r.referenceElement
        })
      })

    // lastPaperFooter: force a trailing page if the last page overflows it.
    if (this.lastPaperFooter && p[p.length - 1].printLine > this.lastPaperFooter) {
      l = this.createNewPage(p.length, ref)
      p.push(l)
      panelTarget.append(l.getTarget())
    }
    // panelPaperRule: keep total page count odd or even.
    if (this.panelPaperRule === 'odd' && p.length % 2 === 0) {
      l = this.createNewPage(p.length, ref)
      p.push(l)
      panelTarget.append(l.getTarget())
    }
    else if (this.panelPaperRule === 'even' && p.length % 2 === 1) {
      l = this.createNewPage(p.length, ref)
      p.push(l)
      panelTarget.append(l.getTarget())
    }

    p.forEach((page, i) => {
      page.updatePaperNumber(i + 1, p.length, options?.paperNumberToggleInEven)
      this.fillPaperHeaderAndFooter(page, data, p.length)
      if (options?.leftOffset != null)
        page.setLeftOffset(options.leftOffset)
      if (options?.topOffset != null)
        page.setTopOffset(options.topOffset)
      else if (this.leftOffset != null || this.topOffset != null)
        page.setOffset(this.leftOffset || 0, this.topOffset || 0)
    })

    panelTarget.prepend(this.getPrintStyle())
    this.css(panelTarget)
    return panelTarget
  }

  fillPaperHeaderAndFooter(page: PrintPage, data: PrintData, totalPages: number): void {
    this.printElements.forEach((el) => {
      if (el.isFixed() || el.isHeaderOrFooter()) {
        if (el.showInPage(page.index, totalPages)) {
          const results = el.getHtml(page, data)
          results.forEach((r: any) => {
            if (r.target)
              page.append(r.target)
          })
        }
      }
    })
  }

  getPrintStyle(): Dom {
    const orient = (this.height >= this.width) ? 'portrait' : 'landscape'
    const style = dom(`<style printStyle>@page { size: ${this.width}mm ${this.height}mm ${orient}; margin: 0; padding: 0; border: 0; }</style>`)
    return style
  }

  getPrintSizeStyle(): string {
    const orient = (this.height >= this.width) ? 'portrait' : 'landscape'
    return `@page { size: ${this.width}mm ${this.height}mm ${orient}; }`
  }

  getPanelEntity(includePrintElementType = false): PrintPanelEntity {
    return {
      index: this.index,
      width: this.width,
      height: this.height,
      paperType: this.paperType,
      paperHeader: this.paperHeader,
      paperFooter: this.paperFooter,
      paperNumberLeft: this.paperNumberLeft,
      paperNumberTop: this.paperNumberTop,
      paperNumberDisabled: this.paperNumberDisabled,
      paperNumberFormat: this.paperNumberFormat,
      panelPaperRule: this.panelPaperRule,
      rotate: this.rotate,
      firstPaperFooter: this.firstPaperFooter,
      evenPaperFooter: this.evenPaperFooter,
      oddPaperFooter: this.oddPaperFooter,
      lastPaperFooter: this.lastPaperFooter,
      topOffset: this.topOffset,
      leftOffset: this.leftOffset,
      fontFamily: this.fontFamily,
      orient: this.orient,
      printElements: this.printElements.map(el => el.getPrintElementEntity(includePrintElementType)),
    }
  }

  addPrintElement(type: string, options: any, title?: string): any {
    const elementType = createPrintElementType({ tid: '', title: title || '', type: type as any })
    const printElement = elementType.createPrintElement(options)
    printElement.setTemplateId(this.templateId)
    printElement.setPanel(this)
    this.printElements.push(printElement)
    event.trigger(`iprintTemplateDataChanged_${this.templateId}`)
    return printElement
  }

  addPrintText(options: any): any {
    return this.addPrintElement('text', options, '文本')
  }

  addPrintHtml(options: any): any {
    return this.addPrintElement('html', options, 'html')
  }

  addPrintTable(options: any): any {
    if (options.columns)
      (options as any)._columns = options.columns
    const el = this.addPrintElement('table', options, '表格')
    return el
  }

  addPrintImage(options: any): any {
    return this.addPrintElement('image', options, '图片')
  }

  addPrintLongText(options: any): any {
    return this.addPrintElement('longText', options, '长文本')
  }

  addPrintVline(options: any): any {
    return this.addPrintElement('vline', options, '竖线')
  }

  addPrintHline(options: any): any {
    return this.addPrintElement('hline', options, '横线')
  }

  addPrintRect(options: any): any {
    return this.addPrintElement('rect', options, '矩形')
  }

  addPrintOval(options: any): any {
    return this.addPrintElement('oval', options, '椭圆')
  }

  clear(): void {
    this.printElements = []
    event.trigger(`iprintTemplateDataChanged_${this.templateId}`)
  }

  resize(paperType: string | undefined, width: number, height: number, rotate?: boolean): void {
    void rotate
    this.paperType = paperType
    this.width = width
    this.height = height
    this.paperFooter = mm.toPt(height)
    if (this.designPaper) {
      this.designPaper.width = width
      this.designPaper.height = height
      this.designPaper.paperFooter = this.paperFooter
      this.designPaper.target.css({ width: `${width}mm`, height: `${height - config.paperHeightTrim}mm` })
    }
  }

  rotatePaper(): void {
    const t = this.width
    this.width = this.height
    this.height = t
    this.rotate = !this.rotate
    this.resize(this.paperType, this.width, this.height, this.rotate)
  }

  enable(): void {
    this.target.removeClass('hipanel-disable')
  }

  disable(): void {
    this.target.addClass('hipanel-disable')
  }

  getElementByTid(tid: string): any[] {
    return this.printElements.filter(el => el.printElementType.tid === tid)
  }

  getElementByName(name: string): any[] {
    return this.printElements.filter(el => el.options.name === name)
  }

  getFieldsInPanel(): string[] {
    const fields: string[] = []
    this.printElements.forEach((el) => {
      const f = el.getField?.() || el.options.field
      if (f && !fields.includes(f))
        fields.push(f)
    })
    return fields
  }

  droppablePaper(designPaper: PrintPage): void {
    const paperEl = designPaper.getTarget().get(0)
    if (!paperEl)
      return
    makeDroppable(paperEl, {
      accept: '.ep-draggable-item',
      onDrop: (_droppable, state) => {
        const draging = hiPrintlib.getDragingPrintElement()
        if (!draging || !draging.printElement)
          return
        const printElement = draging.printElement
        const paperRect = paperEl.getBoundingClientRect()
        const leftPx = state.left - (paperRect.left + window.scrollX)
        const topPx = state.top - (paperRect.top + window.scrollY)
        const left = mathroundToporleft(px.toPt(leftPx), hiPrintlib.movingDistance)
        const top = mathroundToporleft(px.toPt(topPx), hiPrintlib.movingDistance)
        printElement.updateSizeAndPositionOptions(left, top, printElement.options.width || 100, printElement.options.height || 20)
        printElement.setTemplateId(this.templateId)
        printElement.setPanel(this)
        this.printElements.push(printElement)
        this.appendDesignPrintElement(designPaper, printElement)
        printElement.design(undefined, designPaper.getTarget())
        event.trigger(`iprintTemplateDataChanged_${this.templateId}`)
      },
    })
  }

  bindBatchMoveElement(): void {
    if (!this.designPaper)
      return
    const paperEl = this.designPaper.getTarget().get(0)
    if (!paperEl)
      return
    let rect: HTMLElement | null = null
    let selected: any[] = []
    let startX = 0
    let startY = 0

    paperEl.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0)
        return
      const target = e.target as HTMLElement
      if (target !== paperEl && !target.classList.contains('hiprint-printPaper-content'))
        return
      startX = e.clientX
      startY = e.clientY
      selected = []
      rect = document.createElement('div')
      rect.className = 'mouseRect'
      rect.style.cssText = 'position:absolute;background:#31676f;opacity:0.2;border:1px dashed #000;pointer-events:none;z-index:5'
      paperEl.appendChild(rect)
      const onMove = (ev: MouseEvent) => {
        if (!rect)
          return
        const minX = Math.min(startX, ev.clientX)
        const minY = Math.min(startY, ev.clientY)
        const w = Math.abs(ev.clientX - startX)
        const h = Math.abs(ev.clientY - startY)
        const paperRect = paperEl!.getBoundingClientRect()
        rect.style.left = `${minX - paperRect.left}px`
        rect.style.top = `${minY - paperRect.top}px`
        rect.style.width = `${w}px`
        rect.style.height = `${h}px`
        selected = this.getElementInRect({ left: minX, top: minY, right: minX + w, bottom: minY + h })
        this.printElements.forEach((el) => {
          el.designTarget?.removeClass('hiprint-printElement-selected')
        })
        selected.forEach(el => el.designTarget?.addClass('hiprint-printElement-selected'))
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        rect?.remove()
        rect = null
        this.mouseRectSelectedElement = selected
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    })
  }

  bingKeyboardMoveEvent(target: Dom, _options?: any): void {
    const el = target.get(0)
    if (!el)
      return
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      const arrows: Record<number, [number, number]> = {
        37: [-1, 0],
        38: [0, -1],
        39: [1, 0],
        40: [0, 1],
      }
      const dir = arrows[e.keyCode]
      if (!dir)
        return
      e.preventDefault()
      const step = hiPrintlib.movingDistance
      const move = (els: any[]) => {
        els.forEach((printElement) => {
          const o = printElement.options
          printElement.updateSizeAndPositionOptions(o.left + dir[0] * step, o.top + dir[1] * step, o.width, o.height)
          printElement.designTarget?.css({ left: `${o.left}pt`, top: `${o.top}pt` })
        })
      }
      if (this.mouseRectSelectedElement?.length)
        move(this.mouseRectSelectedElement)
      else
        move([this.printElements.find(p => p.designTarget?.get(0) === el)])
    })
  }

  getElementInRect(rect: { left: number, top: number, right: number, bottom: number }): any[] {
    const result: any[] = []
    this.printElements.forEach((el) => {
      const t = el.designTarget?.get(0) as HTMLElement | undefined
      if (!t)
        return
      const r = t.getBoundingClientRect()
      const elLeft = r.left
      const elTop = r.top
      const elRight = r.right
      const elBottom = r.bottom
      const overlap = !(elRight < rect.left || elLeft > rect.right || elBottom < rect.top || elTop > rect.bottom)
      if (overlap)
        result.push(el)
    })
    return result
  }
}

export interface PrintReferenceElement {
  top: number
  left: number
  height: number
  width: number
  beginPrintPaperIndex: number
  endPrintPaperIndex?: number
  bottomInLastPaper: number
  printTopInPaper: number
  isPositionLeftOrRight: (top: number) => boolean
}

export function makeReference(
  top: number,
  left: number,
  height: number,
  width: number,
  beginPrintPaperIndex: number,
  bottomInLastPaper: number,
  printTopInPaper: number,
  endPrintPaperIndex?: number,
): PrintReferenceElement {
  return {
    top,
    left,
    height,
    width,
    beginPrintPaperIndex,
    endPrintPaperIndex: endPrintPaperIndex ?? beginPrintPaperIndex,
    bottomInLastPaper,
    printTopInPaper,
    isPositionLeftOrRight(t: number): boolean {
      return this.top <= t && this.top + this.height > t
    },
  }
}

/** Snap a coordinate to the nearest multiple of `step` (hiprint's mathroundToporleft). */
export function mathroundToporleft(value: number, step: number): number {
  if (!step)
    return value
  return Math.round(value / step) * step
}
