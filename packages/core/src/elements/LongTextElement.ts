import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { dom } from '../utils/dom'
import { BasePrintElement } from './BasePrintElement'

/**
 * Long text print element. Renders wrapped text into .hiprint-printElement-longText-content.
 * Full per-character pagination (getPaperHtmlResult / BinarySearch) is implemented in Phase 2/8;
 * Phase 1 renders the whole text block and reports a single print line.
 */
export class LongTextElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  override getTitle(): string {
    return this.options.title || this.printElementType.title || ''
  }

  override getData(data?: PrintData): any {
    if (data)
      return data[this.getField()] || ''
    return this.options.testData || this.printElementType.data || ''
  }

  getHideTitle(): boolean {
    return this.options.hideTitle === true
  }

  getText(title: string, data: any): string {
    const formatter = this.getFormatter()
    if (data)
      data = this.options.leftSpaceRemoved ? String(data).replace(/^\s*/, '') : data
    const result = this.getField()
      ? (this.getHideTitle() ? '' : (title ? `${title}：` : '')) + (formatter ? formatter(title, data, this.options, this.currentTemplateData) : data)
      : formatter ? formatter(title, title, this.options, this.currentTemplateData) : (title || '')
    return result || ''
  }

  getLongTextIndent(): string {
    return this.options.longTextIndent
      ? `<span class="long-text-indent" style="margin-left:${this.options.longTextIndent}pt"></span>`
      : '<span class="long-text-indent"></span>'
  }

  updateTargetText(target: Dom, title: string, data: any): void {
    const content = target.find('.hiprint-printElement-longText-content')
    const text = this.getText(title, data)
    content.html(text)
  }

  createTarget(title: string, data: any): Dom {
    const target = dom('<div class="hiprint-printElement hiprint-printElement-longText" style="position: absolute;"><div class="hiprint-printElement-longText-content hiprint-printElement-content" style="height:100%;width:100%"></div></div>')
    this.updateTargetText(target, title, data)
    return target
  }

  override getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const value = this.getData(data)
    const target = this.createTarget(this.getTitle(), value)
    this.updateTargetSize(target)
    this.css(target, value)
    return [{
      target,
      printLine: (this.options.top || 0) + (this.options.height || 42),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}
