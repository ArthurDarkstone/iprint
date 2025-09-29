import type { PrintData, PrintElementOptions, PrintElementType } from '../types'
import { config } from '../config'
import { event } from '../utils'

/**
 * Base class for all print elements
 */
export abstract class BasePrintElement {
  public id: string
  public options: PrintElementOptions
  public printElementType: PrintElementType
  public templateId?: string
  public panel?: any
  public designTarget?: any
  public designPaper?: any
  public currentTemplateData?: PrintData

  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    this.printElementType = printElementType
    this.id = this.generateId()
    this.options = options ? { ...options } : {}
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  getConfigOptions(): PrintElementOptions {
    return config.get(this.printElementType.type as any) || {}
  }

  getConfigOptionsByName(name: string): any {
    return config.get(name as any) || {}
  }

  getProxyTarget(options?: PrintElementOptions): any {
    if (options) {
      this.setProxyTargetOption(options)
    }
    const data = this.getData()
    const target = this.createTarget(this.getTitle(), data)
    this.updateTargetSize(target)
    this.css(target, data)
    return target
  }

  setProxyTargetOption(options: PrintElementOptions): void {
    this.getPrintElementEntity()
    Object.assign(this.options, options)
  }

  showInPage(pageIndex: number, totalPages: number): boolean {
    const showInPage = this.options.showInPage
    const unShowInPage = this.options.unShowInPage

    if (showInPage) {
      if (Array.isArray(showInPage)) {
        return showInPage.includes(pageIndex)
      }
      return showInPage === pageIndex
    }

    if (unShowInPage) {
      if (Array.isArray(unShowInPage)) {
        return !unShowInPage.includes(pageIndex)
      }
      return unShowInPage !== pageIndex
    }

    return (pageIndex !== 0 || unShowInPage !== 'first')
      && (pageIndex !== totalPages - 1 || unShowInPage !== 'last')
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
    return this.printElementType.title
  }

  updateSizeAndPositionOptions(left: number, top: number, width: number, height: number): void {
    this.options.left = left
    this.options.top = top
    this.options.width = width
    this.options.height = height
    event.trigger(`iprintTemplateDataChanged_${this.templateId}`)
  }

  initSizeByHtml(htmlElement: any): void {
    if (htmlElement && htmlElement.length) {
      this.createTempContainer()
      const cloned = htmlElement.clone()
      this.getTempContainer().append(cloned)
      // Note: This would need jQuery-like functionality for width/height
      // this.options.initSizeByHtml(parseInt(px.toPt(cloned.width()).toString()), parseInt(px.toPt(cloned.height()).toString()))
      this.removeTempContainer()
    }
  }

  updateTargetSize(target: any): void {
    target.css('width', `${this.options.width}pt`)
    target.css('height', `${this.options.height}pt`)
  }

  updateTargetWidth(target: any): void {
    target.css('width', `${this.options.width}pt`)
  }

  getDesignTarget(paper: any): any {
    this.designTarget = this.getHtml(paper)[0].target
    this.designPaper = paper
    this.designTarget.click(() => {
      event.trigger(this.getPrintElementSelectEventKey(), {
        printElement: this,
      })
    })
    return this.designTarget
  }

  getPrintElementSelectEventKey(): string {
    return `PrintElementSelectEventKey_${this.templateId}`
  }

  design(_paper: any, _options?: any): void {
    // This would implement the drag and resize functionality
    // For now, it's a placeholder
  }

  getPrintElementEntity(_isDesign?: boolean): any {
    // This would return the element entity
    return {}
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

  onResize(left: number, top: number, width: number, height: number, _options: any): void {
    this.updateSizeAndPositionOptions(left, top, width, height)
  }

  getOrderIndex(): number {
    return this.options.top || 0
  }

  getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []
    // Implementation would go here
    return results
  }

  getHtml2(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []
    // Implementation would go here
    return results
  }

  getBeginPrintTopInPaperByReferenceElement(referenceElement: any): number {
    const top = this.options.top || 0
    if (this.isHeaderOrFooter() || this.isFixed()) {
      return top
    }
    if (referenceElement.isPositionLeftOrRight(top)) {
      return referenceElement.printTopInPaper + (top - referenceElement.top)
    }
    return referenceElement.bottomInLastPaper + (top - (referenceElement.top + referenceElement.height))
  }

  css(target: any, data: PrintData): void {
    const configOptions = this.getConfigOptions()
    const styles: any = {}

    Object.keys(configOptions).forEach((key) => {
      if (this.options[key] !== undefined) {
        styles[key] = this.options[key]
      }
    })

    this.stylerCss(target, data)
  }

  stylerCss(target: any, data: PrintData): void {
    const styler = this.getStyler()
    if (styler) {
      const styles = styler(this.getData(data), this.options, target, this.currentTemplateData)
      if (styles) {
        Object.keys(styles).forEach((key) => {
          target.css(key, styles[key])
        })
      }
    }
  }

  getData(data?: PrintData): any {
    return data ? (data[this.getField()] || '') : this.printElementType.data
  }

  getPrintElementOptionItems(): any[] {
    // This would return option items for the UI
    return []
  }

  getPrintElementOptionItemsByName(_name: string): any[] {
    // This would return specific option items
    return []
  }

  filterOptionItems(items: any[]): any[] {
    return this.printElementType.field
      ? items.filter(item => item.name !== 'field')
      : items
  }

  getStyler(): Function | null {
    if (this.options.styler) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function('value', 'options', 'target', 'templateData', this.options.styler)
      }
      catch (e) {
        console.warn('Invalid styler function:', e)
      }
    }
    return null
  }

  getFormatter(): Function | null {
    if (this.options.formatter) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function('value', 'options', 'target', 'templateData', this.options.formatter)
      }
      catch (e) {
        console.warn('Invalid formatter function:', e)
      }
    }
    return null
  }

  isHeaderOrFooter(): boolean {
    return this.options.isHeader || this.options.isFooter || false
  }

  isFixed(): boolean {
    return this.options.isFixed || false
  }

  setCurrenttemplateData(data?: PrintData): void {
    this.currentTemplateData = data
  }

  createTempContainer(): void {
    // Implementation for temporary container
  }

  getTempContainer(): any {
    // Implementation for getting temporary container
    return null
  }

  removeTempContainer(): void {
    // Implementation for removing temporary container
  }

  updateDesignViewFromOptions(): void {
    // Implementation for updating design view
  }

  createTarget(_title: string, _data: any): any {
    // This would create the actual DOM element
    // Implementation depends on the specific element type
    return null
  }

  bingCopyEvent(_target: any): void {
    // Implementation for copy event binding
  }

  bingKeyboardMoveEvent(_target: any, _options?: any): void {
    // Implementation for keyboard move event binding
  }

  createLineOfPosition(_paper: any): void {
    // Implementation for creating position lines
  }

  removeLineOfPosition(): void {
    // Implementation for removing position lines
  }
}
