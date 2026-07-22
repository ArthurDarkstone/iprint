import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { dom } from '../utils/dom'
import { BasePrintElement } from './BasePrintElement'

/**
 * Image print element. Renders an <img> into .hiprint-printElement-image-content.
 */
export class ImageElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  override getReizeableShowPoints(): string[] {
    return ['se']
  }

  override getData(data?: PrintData): any {
    let e = ''
    if (data)
      e = this.getField() ? (data[this.getField()] || '') : (this.options.src || this.printElementType.data || '')
    else
      e = this.options.src || this.printElementType.data || ''
    const formatter = this.getFormatter()
    if (formatter)
      e = formatter(e, this.options, this.currentTemplateData)
    return e || ''
  }

  createTarget(title: string, data: any): Dom {
    const target = dom('<div class="hiprint-printElement hiprint-printElement-image" style="position: absolute;"><div class="hiprint-printElement-image-content" style="height:100%;width:100%"></div></div>')
    this.updateTargetImage(target, title, data)
    return target
  }

  updateTargetImage(target: Dom, _title: string, data: any): void {
    const content = target.find('.hiprint-printElement-image-content')
    if (content.find('img').length)
      content.find('img').attr('src', data)
    else
      content.html(`<img style="width:100%;height:100%;" src="${data}">`)
  }

  override getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const value = this.getData(data)
    const target = this.createTarget(this.getTitle(), value)
    this.updateTargetSize(target)
    this.css(target, value)
    return [{
      target,
      printLine: (this.options.top || 0) + (this.options.height || 100),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}
