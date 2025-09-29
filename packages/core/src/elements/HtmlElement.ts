import type { PrintData, PrintElementOptions, PrintElementType } from '../types'
import { BasePrintElement } from './BasePrintElement'

/**
 * HTML print element
 */
export class HtmlElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  createTarget(title: string, data: any): any {
    const content = this.getData(data)
    const element = document.createElement('div')
    element.className = 'iprint-printElement iprint-printElement-html'
    element.style.position = 'absolute'
    element.style.left = `${this.options.left || 0}pt`
    element.style.top = `${this.options.top || 0}pt`
    element.style.width = `${this.options.width || 100}pt`
    element.style.height = `${this.options.height || 100}pt`
    element.innerHTML = content || ''
    return element
  }

  getData(data?: PrintData): any {
    if (data) {
      return data[this.getField()] || this.options.content || ''
    }
    return this.options.content || this.printElementType.data || ''
  }

  getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []

    const content = this.getData(data)
    const formatter = this.getFormatter()
    const formattedContent = formatter ? formatter(content, this.options, null, this.currentTemplateData) : content

    const element = this.createTarget(this.getTitle(), data)
    element.innerHTML = formattedContent

    results.push({
      target: element,
      printLine: (this.options.top || 0) + (this.options.height || 100),
    })

    return results
  }
}
