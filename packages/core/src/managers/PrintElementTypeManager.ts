import type { PrintElementType } from '../elements/PrintElementType'
import type { PrintElementTypeGroupLike } from '../types'
import type { Dom } from '../utils/dom'
import { makeDraggable } from '../drag/draggable'
import { createPrintElementType } from '../elements/PrintElementType'
import { PrintElementTypeGroup } from '../elements/PrintElementTypeGroup'
import { dom } from '../utils/dom'
import { hiPrintlib } from '../utils/hiprintlib'

export type EnableDragFn = (items: Dom, getElementType: (tid: string) => PrintElementType | undefined, onDrop: (el: PrintElementType, left: number, top: number) => void) => void

let enableDragImpl: EnableDragFn | null = null

export function setEnableDragImpl(fn: EnableDragFn | null): void {
  enableDragImpl = fn
}

/**
 * Manager for print element types. Mirrors hiprint's PrintElementTypeManager.
 */
export class PrintElementTypeManager {
  private static instance: PrintElementTypeManager
  private allElementTypes: PrintElementType[] = []
  private elementTypeGroups: Record<string, PrintElementTypeGroup[]> = {}

  private constructor() {}

  static getInstance(): PrintElementTypeManager {
    if (!PrintElementTypeManager.instance) {
      PrintElementTypeManager.instance = new PrintElementTypeManager()
    }
    return PrintElementTypeManager.instance
  }

  addPrintElementTypes(moduleName: string, groups: Array<PrintElementTypeGroup | PrintElementTypeGroupLike>): void {
    const wrapped = groups.map(g => g instanceof PrintElementTypeGroup ? g : new PrintElementTypeGroup(g.name, g.printElementTypes))
    this.elementTypeGroups[moduleName] = wrapped
    wrapped.forEach((group) => {
      this.allElementTypes = this.allElementTypes.concat(group.printElementTypes)
    })
  }

  getElementTypeGroups(moduleName?: string): PrintElementTypeGroup[] {
    return this.elementTypeGroups[this.formatModule(moduleName)] || []
  }

  getElementType(tid: string, type?: string): PrintElementType | undefined {
    const found = this.allElementTypes.find(t => t.tid === tid)
    if (found)
      return found
    if (type)
      return createPrintElementType({ tid, title: '', type: type as any })
    return undefined
  }

  build(container: string | HTMLElement | Dom, moduleName?: string): void {
    const host = dom(container as any)
    host.empty()
    const groups = this.getElementTypeGroups(moduleName)
    groups.forEach((group) => {
      const ul = dom('<ul class="hiprint-printElement-type"></ul>')
      group.printElementTypes.forEach((type: PrintElementType) => {
        const li = dom(`<li><ul><li><a class="ep-draggable-item" tid="${type.tid}">${type.title}<span class="glyphicon-class"></span></a></li></ul></li>`)
        ul.append(li)
      })
      host.append(ul)
    })
    this.buildByHtml(host.find('.ep-draggable-item'))
  }

  buildByHtml(items: Dom | string, onDrop?: (el: PrintElementType, left: number, top: number) => void): void {
    const $items = items instanceof Dom ? items : dom(items)
    this.enableDrag($items, onDrop)
  }

  enableDrag(items: Dom, _onDrop?: (el: PrintElementType, left: number, top: number) => void): void {
    if (enableDragImpl) {
      enableDragImpl(items, (tid: string) => this.getElementType(tid), _onDrop || (() => {}))
      return
    }
    // hidraggable-equivalent: clone proxy, track drag in pt, stash the print element
    // being dragged so the paper (PrintPanel.droppablePaper) can create it on drop.
    items.each((el) => {
      const tid = el.getAttribute('tid') || ''
      const type = this.getElementType(tid)
      if (!type)
        return
      makeDraggable(el, {
        proxy: 'clone',
        revert: true,
        moveUnit: 'pt',
        minMove: 4,
        onBeforeDrag: () => {
          hiPrintlib.draging = true
          const printElement = type.createPrintElement()
          hiPrintlib.setDragingPrintElement({ printElement, left: 0, top: 0 })
        },
        onDrag: (_node, left, top) => {
          const draging = hiPrintlib.getDragingPrintElement()
          if (draging) {
            draging.left = left
            draging.top = top
          }
        },
        onStopDrag: () => {
          hiPrintlib.draging = false
        },
      })
    })
  }

  private formatModule(moduleName?: string): string {
    return moduleName || '_default'
  }
}

export const printElementTypeManager: PrintElementTypeManager = PrintElementTypeManager.getInstance()
