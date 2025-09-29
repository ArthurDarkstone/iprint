import type { PrintData, PrintElementOptions, PrintElementType } from '../types'
import { BasePrintElement } from './BasePrintElement'

/**
 * Text print element
 */
export class TextElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  createTarget(title: string, data: any): any {
    const text = this.getData(data)
    const element = document.createElement('div')
    element.className = 'iprint-printElement iprint-printElement-text'
    element.style.position = 'absolute'
    element.style.left = `${this.options.left || 0}pt`
    element.style.top = `${this.options.top || 0}pt`
    element.style.width = `${this.options.width || 100}pt`
    element.style.height = `${this.options.height || 20}pt`
    element.style.fontSize = `${this.options.fontSize || 12}px`
    element.style.fontWeight = String(this.options.fontWeight || 'normal')
    element.style.color = this.options.color || '#000000'
    element.style.textAlign = this.options.textAlign || 'left'
    element.style.lineHeight = `${this.options.lineHeight || 16}px`
    element.style.letterSpacing = `${this.options.letterSpacing || 0}px`
    element.textContent = text || title || ''
    return element
  }

  getData(data?: PrintData): any {
    if (data) {
      return data[this.getField()] || this.options.title || ''
    }
    return this.options.title || this.printElementType.data || ''
  }

  getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []

    const text = this.getData(data)
    const formatter = this.getFormatter()
    const formattedText = formatter ? formatter(text, this.options, null, this.currentTemplateData) : text

    const element = this.createTarget(this.getTitle(), data)
    element.textContent = formattedText

    results.push({
      target: element,
      printLine: (this.options.top || 0) + (this.options.height || 20),
    })

    return results
  }
}
