import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { dom } from '../utils/dom'
import { BasePrintElement } from './BasePrintElement'

/**
 * Base class for line elements (horizontal and vertical).
 * Borders are applied to the visible side only.
 */
export abstract class LineElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  protected abstract borderSide(): 'left' | 'top'

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
    const side = this.borderSide()
    if (o.borderColor)
      target.css(`border-${side}-color`, o.borderColor)
    if (o.borderWidth != null)
      target.css(`border-${side}-width`, `${o.borderWidth}pt`)
    target.css(`border-${side}-style`, o.borderStyle || 'solid')
    this.stylerCss(target, data)
  }

  createTarget(_title: string, _data: any): Dom {
    if (this.printElementType.type === 'vline')
      return dom('<div class="hiprint-printElement hiprint-printElement-vline" style="border-left:1px solid;position: absolute;"></div>')
    return dom('<div class="hiprint-printElement hiprint-printElement-hline" style="border-top:1px solid;position: absolute;"></div>')
  }

  override getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const target = this.createTarget(this.getTitle(), data)
    this.updateTargetSize(target)
    this.css(target, data || {})
    return [{
      target,
      printLine: (this.options.top || 0) + (this.options.height || 9),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}

export class HLineElement extends LineElement {
  protected borderSide(): 'top' {
    return 'top'
  }

  override getReizeableShowPoints(): string[] {
    return ['e']
  }
}

export class VLineElement extends LineElement {
  protected borderSide(): 'left' {
    return 'left'
  }

  override getReizeableShowPoints(): string[] {
    return ['s']
  }
}
