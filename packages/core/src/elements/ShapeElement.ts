import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { dom } from '../utils/dom'
import { BasePrintElement } from './BasePrintElement'

/**
 * Base class for shape elements (rectangle and oval).
 */
export abstract class ShapeElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  override css(target: Dom, data: PrintData): void {
    const o = this.options
    target.css({
      left: `${o.left || 0}pt`,
      top: `${o.top || 0}pt`,
      width: `${o.width}pt`,
      height: `${o.height}pt`,
    })
    if (o.transform)
      target.css('transform', `rotate(${o.transform}deg)`)
    if (o.backgroundColor)
      target.css('background-color', o.backgroundColor)
    if (o.borderColor)
      target.css('border-color', o.borderColor)
    if (o.borderWidth != null)
      target.css('border-width', `${o.borderWidth}pt`)
    target.css('border-style', o.borderStyle || 'solid')
    this.stylerCss(target, data)
  }

  createTarget(_title: string, _data: any): Dom {
    if (this.printElementType.type === 'oval')
      return dom('<div class="hiprint-printElement hiprint-printElement-oval" style="border:1px solid;position: absolute;border-radius: 50%;"></div>')
    return dom('<div class="hiprint-printElement hiprint-printElement-rect" style="border:1px solid;position: absolute;"></div>')
  }

  override getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const target = this.createTarget(this.getTitle(), data)
    this.updateTargetSize(target)
    this.css(target, data || {})
    return [{
      target,
      printLine: (this.options.top || 0) + (this.options.height || 90),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}

export class RectElement extends ShapeElement {
  override getReizeableShowPoints(): string[] {
    return ['s', 'e']
  }
}

export class OvalElement extends ShapeElement {
  override getReizeableShowPoints(): string[] {
    return ['s', 'e']
  }
}
