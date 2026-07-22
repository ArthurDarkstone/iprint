import type { IPrintInitOptions, PrintData } from './types'
import { config } from './config'
import { printElementOptionItemManager } from './managers/PrintElementOptionItemManager'
import { printElementTypeManager } from './managers/PrintElementTypeManager'
import { createDefaultOptionItemFactories } from './optionItems/catalog'
import { defaultProvider } from './provider/defaultProvider'
import { injectCSS } from './styles'
import { PrintTemplate } from './template/PrintTemplate'
import { dom } from './utils/dom'

/**
 * Main iprint object. Mirrors hiprint's top-level API.
 */
export class IPrint {
  private static instance: IPrint
  private providers: any[] = []

  private constructor() {}

  static getInstance(): IPrint {
    if (!IPrint.instance) {
      IPrint.instance = new IPrint()
    }
    return IPrint.instance
  }

  init(options?: IPrintInitOptions): void {
    config.init({
      movingDistance: options?.movingDistance,
      paperHeightTrim: options?.paperHeightTrim,
    })
    injectCSS()

    const providers = options?.providers && options.providers.length > 0
      ? options.providers
      : [defaultProvider]
    this.providers = providers
    this.providers.forEach((provider) => {
      if (provider.addElementTypes)
        provider.addElementTypes(printElementTypeManager)
    })

    if (options?.optionItems)
      printElementOptionItemManager.registerItems(options.optionItems)
    else
      printElementOptionItemManager.registerItems(createDefaultOptionItemFactories() as any)
  }

  get PrintTemplate(): typeof PrintTemplate {
    return PrintTemplate
  }

  get PrintElementTypeManager(): typeof printElementTypeManager {
    return printElementTypeManager
  }

  print(template: PrintTemplate, data?: PrintData, options?: any): void {
    template.print(data, options)
  }

  print2(template: PrintTemplate, data?: PrintData, onSuccess?: Function, onError?: Function, options?: any): void {
    template.print2(data, options).then(() => onSuccess?.()).catch((e) => {
      console.error(e)
      onError?.(e)
    })
  }

  getHtml(template: PrintTemplate, data?: PrintData, options?: any): string {
    return (template.getHtml(data, options) as any).els?.[0]?.outerHTML || ''
  }

  getHtmlByTemplates(templates: Array<{ template: PrintTemplate, data?: PrintData, options?: any }>): string {
    const result = dom('<div class="hiprint-printTemplate"></div>')
    templates.forEach(({ template, data, options }) => {
      const html = template.getHtml(data, options)
      ;(html as any).els?.forEach((el: Node) => result.els[0].appendChild(el))
    })
    return result.els[0]?.outerHTML || ''
  }
}

const iprint: IPrint = IPrint.getInstance()

export function init(options?: IPrintInitOptions): void {
  iprint.init(options)
}

export { PrintTemplate }
export const PrintElementTypeManager: typeof printElementTypeManager = printElementTypeManager

export function print(template: PrintTemplate, data?: PrintData, options?: any): void {
  iprint.print(template, data, options)
}

export function print2(template: PrintTemplate, data?: PrintData, onSuccess?: Function, onError?: Function, options?: any): void {
  iprint.print2(template, data, onSuccess, onError, options)
}

export function getHtml(template: PrintTemplate, data?: PrintData, options?: any): string {
  return iprint.getHtml(template, data, options)
}

if (typeof window !== 'undefined') {
  ;(window as any).iprint = {
    init,
    PrintTemplate,
    PrintElementTypeManager,
    print,
    print2,
    getHtml,
  }
}

export default iprint
