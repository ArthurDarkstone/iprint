import { config } from '../config'
import { guid } from './guid'

export interface DragingPrintElement {
  printElement: any
  left: number
  top: number
}

/**
 * Mirrors hiprint's HiPrintlib.instance: holds global drag state and template registry.
 */
export class HiPrintlib {
  private static instance: HiPrintlib
  draging = false
  private dragingPrintElement: DragingPrintElement | null = null
  private printTemplateContainer: Record<string, any> = {}

  static getInstance(): HiPrintlib {
    if (!HiPrintlib.instance)
      HiPrintlib.instance = new HiPrintlib()
    return HiPrintlib.instance
  }

  get movingDistance(): number {
    return config.movingDistance
  }

  get paperHeightTrim(): number {
    return config.paperHeightTrim
  }

  getDragingPrintElement(): DragingPrintElement | null {
    return this.dragingPrintElement
  }

  setDragingPrintElement(el: DragingPrintElement | null): void {
    this.dragingPrintElement = el
  }

  guid(): string {
    return guid()
  }

  dragLengthCNum(len: number, step?: number): number {
    const s = step ?? this.movingDistance
    return Math.round(len / s) * s
  }

  getPrintTemplateById(id: string): any {
    return this.printTemplateContainer[id]
  }

  setPrintTemplateById(id: string, t: any): void {
    this.printTemplateContainer[id] = t
  }
}

export const hiPrintlib: HiPrintlib = HiPrintlib.getInstance()
