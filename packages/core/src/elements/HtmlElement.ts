import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { dom } from '../utils/dom'
import { BasePrintElement } from './BasePrintElement'

/**
 * HTML print element. Renders a formatter result or options.content as raw HTML.
 */
export class HtmlElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  override getData(data?: PrintData): any {
    if (data)
      return data[this.getField()] ?? this.options.content ?? ''
    return this.options.content ?? this.printElementType.data ?? ''
  }

  updateTargetHtml(target: Dom): void {
    const formatter = this.getFormatter()
    const content = target.find('.hiprint-printElement-html-content')
    if (formatter) {
      const html = formatter(this.getData(this.currentTemplateData), this.options, this.currentTemplateData)
      content.html(html)
    }
    else if (this.options.content) {
      content.append(this.options.content)
    }
  }

  createTarget(title: string, data: any): Dom {
    const target = dom('<div class="hiprint-printElement hiprint-printElement-html" style="position: absolute;"><div class="hiprint-printElement-html-content" style="height:100%;width:100%"></div></div>')
    const formatter = this.getFormatter()
    const content = target.find('.hiprint-printElement-html-content')
    if (formatter) {
      const html = formatter(this.getData(data), this.options, data)
      content.append(html)
    }
    else if (this.options.content) {
      content.append(this.options.content)
    }
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
      printLine: (this.options.top || 0) + (this.options.height || 90),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}
