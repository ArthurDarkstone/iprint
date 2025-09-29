import type { IPrintInitOptions } from './types'
import { config } from './config'
import { printElementTypeManager } from './managers/PrintElementTypeManager'
import { PrintTemplate } from './template/PrintTemplate'

/**
 * Main iprint object
 */
export class IPrint {
  private static instance: IPrint
  private providers: any[] = []

  private constructor() { }

  static getInstance(): IPrint {
    if (!IPrint.instance) {
      IPrint.instance = new IPrint()
    }
    return IPrint.instance
  }

  /**
   * Initialize iprint
   */
  init(options?: IPrintInitOptions): void {
    config.init()

    if (options?.providers) {
      this.providers = options.providers
      this.providers.forEach((provider) => {
        if (provider.addElementTypes) {
          provider.addElementTypes(printElementTypeManager)
        }
      })
    }
  }

  /**
   * Get PrintTemplate class
   */
  get PrintTemplate(): typeof PrintTemplate {
    return PrintTemplate
  }

  /**
   * Get PrintElementTypeManager
   */
  get PrintElementTypeManager(): typeof printElementTypeManager {
    return printElementTypeManager
  }

  /**
   * Print function
   */
  print(template: PrintTemplate, data?: any): void {
    template.print(data)
  }

  /**
   * Get HTML function
   */
  getHtml(template: PrintTemplate, data?: any): string {
    return template.getHtml(data).html()
  }
}

// Create global instance
const iprint: IPrint = IPrint.getInstance()

// Export the main functions
export function init(options?: IPrintInitOptions): void {
  iprint.init(options)
}

export { PrintTemplate }
export const PrintElementTypeManager: typeof printElementTypeManager = printElementTypeManager

export function print(template: PrintTemplate, data?: any): void {
  iprint.print(template, data)
}

export function print2(template: PrintTemplate, data?: any, onSuccess?: Function, onError?: Function): void {
  try {
    iprint.print(template, data)
    onSuccess?.()
  }
  catch (error) {
    onError?.(error)
  }
}

export function getHtml(template: PrintTemplate, data?: any): string {
  return iprint.getHtml(template, data)
}

// Make iprint available globally
if (typeof window !== 'undefined') {
  (window as any).iprint = {
    init,
    PrintTemplate,
    PrintElementTypeManager,
    print,
    print2,
    getHtml,
  }
}

export default iprint
