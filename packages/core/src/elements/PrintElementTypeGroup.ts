import type { PrintElementTypeConfig, PrintElementTypeGroupLike } from '../types'
import { createPrintElementType } from './PrintElementType'

/**
 * A named group of print element types (e.g. 常规 / 辅助).
 */
export class PrintElementTypeGroup {
  name: string
  printElementTypes: any[]

  constructor(name: string, configs: Array<PrintElementTypeConfig | any>) {
    this.name = name
    this.printElementTypes = configs.map(c => createPrintElementType(c))
  }
}

export type { PrintElementTypeGroupLike }
