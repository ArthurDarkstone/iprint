import type { PrintData, PrintElementOptions, PrintElementType } from '../types'
import { BasePrintElement } from './BasePrintElement'

/**
 * Image print element
 */
export class ImageElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  getReizeableShowPoints(): string[] {
    return ['se']
  }

  getData(data?: PrintData): any {
    if (data) {
      return data[this.getField()] || this.options.src || this.printElementType.data || ''
    }
    return this.options.src || this.printElementType.data || ''
  }

  createTarget(title: string, data: any): any {
    const src = this.getData(data)
    const element = document.createElement('div')
    element.className = 'iprint-printElement iprint-printElement-image'
    element.style.position = 'absolute'
    element.style.left = `${this.options.left || 0}pt`
    element.style.top = `${this.options.top || 0}pt`
    element.style.width = `${this.options.width || 100}pt`
    element.style.height = `${this.options.height || 100}pt`
    element.style.backgroundImage = `url(${src})`
    element.style.backgroundSize = 'contain'
    element.style.backgroundRepeat = 'no-repeat'
    element.style.backgroundPosition = 'center'
    return element
  }

  getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []

    const src = this.getData(data)
    const formatter = this.getFormatter()
    const formattedSrc = formatter ? formatter(src, this.options, null, this.currentTemplateData) : src

    const element = this.createTarget(this.getTitle(), data)
    element.style.backgroundImage = `url(${formattedSrc})`

    results.push({
      target: element,
      printLine: (this.options.top || 0) + (this.options.height || 100),
    })

    return results
  }
}
