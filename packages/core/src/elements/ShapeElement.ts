import type { PrintData, PrintElementOptions, PrintElementType } from '../types'
import { BasePrintElement } from './BasePrintElement'

/**
 * Base class for shape elements (rectangle and oval)
 */
export abstract class ShapeElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  getReizeableShowPoints(): string[] {
    return ['se']
  }

  createTarget(_title: string, _data: any): any {
    const element = document.createElement('div')
    element.className = `iprint-printElement iprint-printElement-${this.printElementType.type}`
    element.style.position = 'absolute'
    element.style.left = `${this.options.left || 0}pt`
    element.style.top = `${this.options.top || 0}pt`
    element.style.width = `${this.options.width || 100}pt`
    element.style.height = `${this.options.height || 100}pt`
    element.style.borderColor = this.options.borderColor || '#000000'
    element.style.borderWidth = `${this.options.borderWidth || 1}px`
    element.style.borderStyle = 'solid'
    element.style.backgroundColor = this.options.backgroundColor || 'transparent'

    if (this.printElementType.type === 'oval') {
      element.style.borderRadius = '50%'
    }

    return element
  }

  getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const results: any[] = []

    const element = this.createTarget(this.getTitle(), data)

    results.push({
      target: element,
      printLine: (this.options.top || 0) + (this.options.height || 100),
    })

    return results
  }
}

/**
 * Rectangle element
 */
export class RectElement extends ShapeElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }
}

/**
 * Oval element
 */
export class OvalElement extends ShapeElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }
}
