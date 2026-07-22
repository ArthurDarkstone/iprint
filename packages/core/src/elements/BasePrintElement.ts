import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { config } from '../config'
import { makeDraggable } from '../drag/draggable'
import { makeResizable } from '../drag/resizeable'
import { printElementOptionItemManager } from '../managers/PrintElementOptionItemManager'
import { dom } from '../utils/dom'
import { event } from '../utils/event'
import { guid } from '../utils/guid'
import { hiPrintlib } from '../utils/hiprintlib'
import { pt } from '../utils/units'

/**
 * Base class for all print elements. Faithful port of hiprint BasePrintElement.
 */
export abstract class BasePrintElement {
  public id: string
  public options: PrintElementOptions
  public printElementType: PrintElementType
  public templateId?: string
  public panel?: any
  public designTarget?: Dom
  public designPaper?: Dom
  public currentTemplateData?: PrintData

  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    this.printElementType = printElementType
    this.id = guid()
    this.options = options ? { ...options } : {}
  }

  getConfigOptions(): any {
    return config.getCatalog(this.printElementType.type as any)
  }

  getConfigOptionsByName(name: string): any {
    return config.getCatalog(name as any)
  }

  getProxyTarget(options?: PrintElementOptions): Dom {
    if (options)
      this.setProxyTargetOption(options)
    const data = this.getData()
    const target = this.createTarget(this.getTitle(), data)
    this.updateTargetSize(target)
    this.css(target, data)
    return target
  }

  setProxyTargetOption(options: PrintElementOptions): void {
    Object.assign(this.options, options)
  }

  showInPage(pageIndex: number, totalPages: number): boolean {
    const showInPage = this.options.showInPage as any
    const unShowInPage = this.options.unShowInPage as any
    if (showInPage !== undefined && showInPage !== '' && showInPage !== null) {
      if (Array.isArray(showInPage))
        return showInPage.includes(pageIndex)
      if (typeof showInPage === 'number')
        return showInPage === pageIndex
      if (showInPage === 'first')
        return pageIndex === 0
      if (showInPage === 'last')
        return pageIndex === totalPages - 1
      if (showInPage === 'odd')
        return pageIndex % 2 === 0
      if (showInPage === 'even')
        return pageIndex % 2 === 1
    }
    if (unShowInPage !== undefined && unShowInPage !== '' && unShowInPage !== null) {
      if (Array.isArray(unShowInPage))
        return !unShowInPage.includes(pageIndex)
      if (typeof unShowInPage === 'number')
        return unShowInPage !== pageIndex
      if (unShowInPage === 'first')
        return pageIndex !== 0
      if (unShowInPage === 'last')
        return pageIndex !== totalPages - 1
    }
    return true
  }

  setTemplateId(templateId: string): void {
    this.templateId = templateId
  }

  setPanel(panel: any): void {
    this.panel = panel
  }

  getField(): string {
    return this.options.field || this.printElementType.field || ''
  }

  getTitle(): string {
    return this.printElementType.title || ''
  }

  getHeight(): number {
    return this.options.height ?? 0
  }

  getWidth(): number {
    return this.options.width ?? 0
  }

  updateSizeAndPositionOptions(left: number, top: number, width: number, height: number): void {
    this.options.left = left
    this.options.top = top
    this.options.width = width
    this.options.height = height
    event.trigger(`iprintTemplateDataChanged_${this.templateId}`)
  }

  initSizeByHtml(htmlElement: Dom): void {
    if (htmlElement && htmlElement.length) {
      this.createTempContainer()
      const cloned = htmlElement.clone()
      this.getTempContainer()?.append(cloned)
      this.removeTempContainer()
    }
  }

  updateTargetSize(target: Dom): void {
    target.css('width', `${this.options.width}pt`)
    target.css('height', `${this.options.height}pt`)
  }

  updateTargetWidth(target: Dom): void {
    target.css('width', `${this.options.width}pt`)
  }

  getDesignTarget(paper: Dom): Dom {
    this.designTarget = this.getHtml(paper)[0].target
    this.designPaper = paper
    this.designTarget.on('click', () => {
      event.trigger(this.getPrintElementSelectEventKey(), { printElement: this })
    })
    return this.designTarget
  }

  getPrintElementSelectEventKey(): string {
    return `PrintElementSelectEventKey_${this.templateId}`
  }

  design(paper: Dom, options?: any): void {
    if (!this.designTarget)
      return
    const node = this.designTarget.get(0)
    if (!node)
      return
    const axisEnabled = options?.axisEnabled
    const axis = this.options.axis && axisEnabled ? (this.options.axis === 'h' ? 'x' : 'y') : ''
    const step = hiPrintlib.movingDistance

    makeDraggable(node, {
      axis: axis as any,
      moveUnit: 'pt',
      minMove: step,
      onBeforeDrag: () => {
        hiPrintlib.draging = true
        this.createLineOfPosition(paper)
      },
      onDrag: (_el, left, top) => {
        this.updateSizeAndPositionOptions(left, top, this.options.width as number, this.options.height as number)
        this.createLineOfPosition(paper)
      },
      onStopDrag: () => {
        hiPrintlib.draging = false
        this.removeLineOfPosition()
      },
    })

    makeResizable(node, {
      showPoints: this.getReizeableShowPoints(),
      minResize: step,
      noContainer: true,
      onBeforeResize: () => {
        hiPrintlib.draging = true
      },
      onResize: (_el, width, height, top, left) => {
        this.onResize(left, top, width, height, options)
        this.createLineOfPosition(paper)
      },
      onStopResize: () => {
        hiPrintlib.draging = false
        this.removeLineOfPosition()
      },
    })

    this.bingKeyboardMoveEvent(this.designTarget, paper)
  }

  getPrintElementEntity(isDesign = false): any {
    const entity: any = {
      options: { ...this.options },
    }
    if (isDesign || this.printElementType.tid == null) {
      entity.printElementType = {
        title: this.printElementType.title,
        type: this.printElementType.type,
      }
    }
    else {
      entity.tid = this.printElementType.tid
    }
    return entity
  }

  submitOption(): void {
    this.getPrintElementOptionItems().forEach((item: any) => {
      const value = item.getValue()
      if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach((key) => {
          this.options[key] = value[key]
        })
      }
      else {
        this.options[item.name] = value
      }
    })
    this.updateDesignViewFromOptions()
    event.trigger(`iprintTemplateDataChanged_${this.templateId}`)
  }

  getReizeableShowPoints(): string[] {
    return ['s', 'e']
  }

  onResize(left: number, top: number, width: number, height: number, _options?: any): void {
    this.updateSizeAndPositionOptions(left, top, width, height)
  }

  getOrderIndex(): number {
    return this.options.top || 0
  }

  getHtml(_paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    return []
  }

  getHtml2(_paper: any, data?: PrintData, _options?: any): any[] {
    return this.getHtml(_paper, data, _options)
  }

  getBeginPrintTopInPaperByReferenceElement(referenceElement: any): number {
    const top = this.options.top || 0
    if (this.isHeaderOrFooter() || this.isFixed())
      return top
    if (referenceElement.isPositionLeftOrRight(top))
      return referenceElement.printTopInPaper + (top - referenceElement.top)
    return referenceElement.bottomInLastPaper + (top - (referenceElement.top + referenceElement.height))
  }

  isPositionLeftOrRight(top: number): boolean {
    return top >= (this.options.top || 0) && top < (this.options.top || 0) + (this.options.height || 0)
  }

  css(target: Dom, data: PrintData): void {
    const o = this.options
    target.css({
      left: `${o.left || 0}pt`,
      top: `${o.top || 0}pt`,
      width: `${o.width}pt`,
      height: `${o.height}pt`,
    })
    if (o.fontFamily)
      target.css('font-family', o.fontFamily)
    if (o.fontSize != null)
      target.css('font-size', `${o.fontSize}pt`)
    if (o.fontWeight != null)
      target.css('font-weight', String(o.fontWeight))
    if (o.color)
      target.css('color', o.color)
    if (o.textAlign)
      target.css('text-align', o.textAlign)
    if (o.lineHeight != null)
      target.css('line-height', `${o.lineHeight}pt`)
    if (o.letterSpacing != null)
      target.css('letter-spacing', `${o.letterSpacing}pt`)
    if (o.textDecoration)
      target.css('text-decoration', o.textDecoration)
    if (o.textContentVerticalAlign) {
      target.addClass(`hiprint-text-content-${o.textContentVerticalAlign}`)
    }
    if (o.transform)
      target.css('transform', `rotate(${o.transform}deg)`)
    if (o.backgroundColor)
      target.css('background-color', o.backgroundColor)
    if (o.borderColor)
      target.css('border-color', o.borderColor)
    if (o.borderWidth != null)
      target.css('border-width', `${o.borderWidth}pt`)
    if (o.borderLeft)
      target.css('border-left-style', o.borderLeft === 'none' ? 'none' : o.borderLeft)
    if (o.borderTop)
      target.css('border-top-style', o.borderTop === 'none' ? 'none' : o.borderTop)
    if (o.borderRight)
      target.css('border-right-style', o.borderRight === 'none' ? 'none' : o.borderRight)
    if (o.borderBottom)
      target.css('border-bottom-style', o.borderBottom === 'none' ? 'none' : o.borderBottom)
    if (o.contentPaddingLeft != null)
      target.css('padding-left', `${o.contentPaddingLeft}pt`)
    if (o.contentPaddingTop != null)
      target.css('padding-top', `${o.contentPaddingTop}pt`)
    if (o.contentPaddingRight != null)
      target.css('padding-right', `${o.contentPaddingRight}pt`)
    if (o.contentPaddingBottom != null)
      target.css('padding-bottom', `${o.contentPaddingBottom}pt`)
    this.stylerCss(target, data)
  }

  stylerCss(target: Dom, data: PrintData): void {
    const styler = this.getStyler()
    if (styler) {
      const styles = styler(this.getData(data), this.options, target, this.currentTemplateData)
      if (styles)
        target.css(styles)
    }
  }

  getData(data?: PrintData): any {
    return data ? (data[this.getField()] ?? '') : this.printElementType.data
  }

  getPrintElementOptionItems(): any[] {
    const catalog = this.getConfigOptions()
    const names = catalog.supportOptions || []
    const items = printElementOptionItemManager.buildItems(names)
    return this.filterOptionItems(items)
  }

  getPrintElementOptionItemsByName(name: string): any[] {
    const item = printElementOptionItemManager.createItem(name)
    return item ? [item] : []
  }

  filterOptionItems(items: any[]): any[] {
    return this.printElementType.field ? items.filter(item => item.name !== 'field') : items
  }

  getStyler(): Function | null {
    const body = this.options.styler || this.printElementType.styler
    if (body) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function('value', 'options', 'target', 'templateData', `return (${body})`)
      }
      catch (e) {
        console.warn('Invalid styler function:', e)
      }
    }
    return null
  }

  getFormatter(): Function | null {
    const body = this.options.formatter || this.printElementType.formatter
    if (body) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function('value', 'options', 'target', 'templateData', `return (${body})`)
      }
      catch (e) {
        console.warn('Invalid formatter function:', e)
      }
    }
    return null
  }

  isHeaderOrFooter(): boolean {
    if (!this.panel)
      return false
    const top = this.options.top || 0
    return top < (this.panel.paperHeader || 0) || top >= (this.panel.paperFooter || Number.POSITIVE_INFINITY)
  }

  isFixed(): boolean {
    return this.options.fixed === true
  }

  setCurrenttemplateData(data?: PrintData): void {
    this.currentTemplateData = data
  }

  createTempContainer(): void {
    if (typeof document === 'undefined')
      return
    let el = document.querySelector<HTMLElement>('.hiprint_temp_Container')
    if (!el) {
      el = document.createElement('div')
      el.className = 'hiprint_temp_Container'
      el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden'
      document.body.appendChild(el)
    }
  }

  getTempContainer(): Dom | null {
    if (typeof document === 'undefined')
      return null
    const el = document.querySelector('.hiprint_temp_Container')
    return el ? dom(el) : null
  }

  removeTempContainer(): void {
    document.querySelector('.hiprint_temp_Container')?.remove()
  }

  updateDesignViewFromOptions(): void {
    if (this.designTarget) {
      this.updateTargetSize(this.designTarget)
      const data = this.currentTemplateData
      const newTarget = this.getProxyTarget(this.options)
      this.designTarget.els.forEach((el) => {
        el.className = newTarget.get(0)?.className || el.className
        el.innerHTML = newTarget.get(0)?.innerHTML ?? ''
      })
      this.css(this.designTarget, data || {})
    }
  }

  abstract createTarget(title: string, data: any): Dom

  bingCopyEvent(_target: Dom): void {
    // copy/paste: stub
  }

  bingKeyboardMoveEvent(target: Dom, _options?: any): void {
    const el = target.get(0)
    if (!el)
      return
    el.tabIndex = 1
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
      const o = this.options
      this.updateSizeAndPositionOptions((o.left || 0) + dir[0] * step, (o.top || 0) + dir[1] * step, o.width as number, o.height as number)
      target.css({ left: `${o.left}pt`, top: `${o.top}pt` })
    })
  }

  createLineOfPosition(paper: Dom): void {
    if (!paper || !this.designTarget)
      return
    this.removeLineOfPosition()
    const o = this.options
    const top = o.top || 0
    const left = o.left || 0
    const width = o.width || 0
    const height = o.height || 0
    const paperWidth = pt.toPx(this.panel?.width ? mmToPt(this.panel.width) : 0)
    const paperHeight = pt.toPx(this.panel?.height ? mmToPt(this.panel.height) : 0)
    const base: Record<string, string> = {
      'position': 'absolute',
      'border-style': 'dashed',
      'border-color': 'rgb(169,169,169)',
      'pointer-events': 'none',
      'z-index': '0',
    }
    const topLine = dom('<div>').addClass(`toplineOfPosition${this.id}`).css({ ...base, 'top': `${top}pt`, 'left': 0, 'width': `${paperWidth}px`, 'border-top-width': '1px', 'height': 0 })
    const leftLine = dom('<div>').addClass(`leftlineOfPosition${this.id}`).css({ ...base, 'left': `${left}pt`, 'top': 0, 'height': `${paperHeight}px`, 'border-left-width': '1px', 'width': 0 })
    const rightLine = dom('<div>').addClass(`rightlineOfPosition${this.id}`).css({ ...base, 'left': `${left + width}pt`, 'top': 0, 'height': `${paperHeight}px`, 'border-left-width': '1px', 'width': 0 })
    const bottomLine = dom('<div>').addClass(`bottomlineOfPosition${this.id}`).css({ ...base, 'top': `${top + height}pt`, 'left': 0, 'width': `${paperWidth}px`, 'border-top-width': '1px', 'height': 0 })
    paper.append(topLine, leftLine, rightLine, bottomLine)
  }

  removeLineOfPosition(): void {
    document.querySelectorAll(`.toplineOfPosition${this.id}, .leftlineOfPosition${this.id}, .rightlineOfPosition${this.id}, .bottomlineOfPosition${this.id}`).forEach(el => el.remove())
  }
}

function mmToPt(mmVal: number): number {
  return (72 / 25.4) * mmVal
}
