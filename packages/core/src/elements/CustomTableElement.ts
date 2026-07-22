import type { PrintElementOptions } from '../types'
import type { PrintElementType } from './PrintElementType'
import { TableElement } from './TableElement'

/**
 * Excel-like editable table print element.
 * Phase 1 renders like a data table; the in-place HiTable editor
 * (cell edit / context menu / column resize / merge) is wired in Phase 5.
 */
export class CustomTableElement extends TableElement {
  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
    if (this.printElementType.editable === undefined)
      this.printElementType.editable = true
  }

  override getReizeableShowPoints(): string[] {
    return ['s', 'e']
  }
}
