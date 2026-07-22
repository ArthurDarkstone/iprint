import type { PrintData, PrintElementOptions } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { dom } from '../utils/dom'
import { formatDataType } from '../utils/helpers'
import { pt } from '../utils/units'
import { BasePrintElement } from './BasePrintElement'

let jsbarcodeLoader: Promise<typeof import('jsbarcode')['default']> | null = null
function loadJsBarcode() {
  if (!jsbarcodeLoader)
    jsbarcodeLoader = import('jsbarcode').then(m => (m.default ?? m) as any)
  return jsbarcodeLoader
}

let qrcodeLoader: Promise<typeof import('qrcode')['default']> | null = null
function loadQRCode() {
  if (!qrcodeLoader)
    qrcodeLoader = import('qrcode').then(m => (m.default ?? m) as any)
  return qrcodeLoader
}

/**
 * Text print element. Supports plain text, barcode (JsBarcode) and qrcode (QRCode).
 */
export class TextElement extends BasePrintElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
  }

  getHideTitle(): boolean {
    return this.options.hideTitle === true
  }

  getTextType(): string {
    return (this.options.textType as string) || 'text'
  }

  getBarcodeMode(): string {
    return (this.options.barcodeMode as string) || 'CODE128'
  }

  override getTitle(): string {
    let t = this.options.title || this.printElementType.title || ''
    if (t)
      t = replaceEnterAndNewlineAndTab(t)
    return t
  }

  override getData(data?: PrintData): any {
    let e: any
    if (data)
      e = data[this.getField()] || ''
    else
      e = this.options.testData || this.printElementType.data || ''
    if (this.options.format) {
      if (this.options.dataType === 'datetime')
        return formatDataType(e, 'datetime', this.options.format)
      if (this.options.dataType === 'boolean' || this.options.dataType === 'boolen')
        return formatDataType(e, 'boolean', this.options.format)
    }
    return e
  }

  createTarget(title: string, data: any): Dom {
    const target = dom('<div tabindex="1" class="hiprint-printElement hiprint-printElement-text" style="position: absolute;"><div class="hiprint-printElement-text-content hiprint-printElement-content" style="height:100%;width:100%"></div></div>')
    this.updateTargetText(target, title, data)
    return target
  }

  updateTargetText(target: Dom, title: string, data: any): void {
    const formatter = this.getFormatter()
    const content = target.find('.hiprint-printElement-text-content')
    let p = ''
    if (this.getField()) {
      const prefix = this.getHideTitle() ? '' : (title ? `${title}：` : '')
      p = prefix + (formatter ? formatter(title, data, this.options, this.currentTemplateData, target) : data)
    }
    else {
      const value = formatter ? formatter(title, title, this.options, this.currentTemplateData, target) : title
      p = value
    }
    const textType = this.getTextType()
    if (textType === 'text') {
      content.html(p)
    }
    else if (textType === 'barcode') {
      this.renderBarcode(content, data)
    }
    else if (textType === 'qrcode') {
      this.renderQrcode(content, data)
    }
  }

  async renderBarcode(content: Dom, data: any): Promise<void> {
    content.html('<svg width="100%" display="block" height="100%" class="hibarcode_imgcode" preserveAspectRatio="none slice"></svg><div class="hibarcode_displayValue"></div>')
    if (!data) {
      content.html('')
      return
    }
    try {
      const JsBarcode: any = await loadJsBarcode()
      JsBarcode(content.find('.hibarcode_imgcode').get(0), data, {
        format: this.getBarcodeMode(),
        width: 1,
        textMargin: -1,
        lineColor: this.options.color || '#000000',
        margin: 0,
        height: Number.parseInt(String(pt.toPx(this.options.height || 10))),
        displayValue: false,
      })
      content.find('.hibarcode_imgcode').attr('height', '100%')
      content.find('.hibarcode_imgcode').attr('width', '100%')
      if (!this.getHideTitle())
        content.find('.hibarcode_displayValue').html(data)
    }
    catch (e) {
      console.warn('barcode render failed', e)
      content.html('此格式不支持该文本')
    }
  }

  async renderQrcode(content: Dom, data: any): Promise<void> {
    content.html('')
    if (!data)
      return
    try {
      const QRCode: any = await loadQRCode()
      const w = Number.parseInt(String(pt.toPx(this.options.width || 20)))
      const h = Number.parseInt(String(pt.toPx(this.options.height || 20)))
      // QRCode lib API: new QRCode(element, opts).makeCode(text)
      new QRCode(content.get(0), {
        width: w,
        height: h,
        colorDark: this.options.color || '#000000',
        useSVG: true,
      }).makeCode(data)
    }
    catch (e) {
      console.warn('qrcode render failed', e)
      content.html('二维码生成失败')
    }
  }

  override onResize(left: number, top: number, width: number, height: number, options?: any): void {
    super.onResize(left, top, width, height, options)
    if (this.getTextType() === 'barcode' || this.getTextType() === 'qrcode') {
      const data = this.getData(this.currentTemplateData)
      this.updateTargetText(this.designTarget as Dom, this.getTitle(), data)
    }
  }

  override getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    void paper
    this.setCurrenttemplateData(data)
    const title = this.getTitle()
    const value = this.getData(data)
    const target = this.createTarget(title, value)
    this.updateTargetSize(target)
    this.css(target, value)
    return [{
      target,
      printLine: (this.options.top || 0) + (this.options.height || 9.75),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}

export function replaceEnterAndNewlineAndTab(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '    ')
}
