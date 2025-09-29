import type { PrintData, PrintElementOptions, PrintElementType } from '../types'
import { BasePrintElement } from './BasePrintElement'

/**
 * Base class for line elements (horizontal and vertical)
 */
export abstract class LineElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  getReizeableShowPoints(): string[] {
    return ['e']
  }

  createTarget(_title: string, _data: any): any {
    const element = document.createElement('div')
    element.className = `iprint-printElement iprint-printElement-${this.printElementType.type}`
    element.style.position = 'absolute'
    element.style.left = `${this.options.left || 0}pt`
    element.style.top = `${this.options.top || 0}pt`
    element.style.width = `${this.options.width || 100}pt`
    element.style.height = `${this.options.height || 1}pt`
    element.style.borderColor = this.options.borderColor || '#000000'
    element.style.borderWidth = `${this.options.borderWidth || 1}px`
    element.style.borderStyle = 'solid'

    if (this.printElementType.type === 'hline') {
      element.style.borderTop = `${this.options.borderWidth || 1}px solid ${this.options.borderColor || '#000000'}`
      element.style.borderLeft = 'none'
      element.style.borderRight = 'none'
      element.style.borderBottom = 'none'
    }
    else if (this.printElementType.type === 'vline') {
      element.style.borderLeft = `${this.options.borderWidth || 1}px solid ${this.options.borderColor || '#000000'}`
      element.style.borderTop = 'none'
      element.style.borderRight = 'none'
      element.style.borderBottom = 'none'
    }

    return element
  }

  getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []

    const element = this.createTarget(this.getTitle(), data)

    results.push({
      target: element,
      printLine: (this.options.top || 0) + (this.options.height || 1),
    })

    return results
  }
}

/**
 * Horizontal line element
 */
export class HLineElement extends LineElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }
}

/**
 * Vertical line element
 */
export class VLineElement extends LineElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }
}
