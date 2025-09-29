import type { PrintElementType, PrintElementTypeGroup } from '../types'

/**
 * Manager for print element types
 */
export class PrintElementTypeManager {
  private static instance: PrintElementTypeManager
  private allElementTypes: PrintElementType[] = []
  private elementTypeGroups: Record<string, PrintElementTypeGroup[]> = {}

  private constructor() { }

  static getInstance(): PrintElementTypeManager {
    if (!PrintElementTypeManager.instance) {
      PrintElementTypeManager.instance = new PrintElementTypeManager()
    }
    return PrintElementTypeManager.instance
  }

  /**
   * Add print element types
   */
  addPrintElementTypes(moduleName: string, elementTypes: PrintElementTypeGroup[]): void {
    this.elementTypeGroups[moduleName] = elementTypes
    elementTypes.forEach((group) => {
      this.allElementTypes = this.allElementTypes.concat(group.printElementTypes)
    })
  }

  /**
   * Get element type groups for a module
   */
  getElementTypeGroups(moduleName?: string): PrintElementTypeGroup[] {
    return this.elementTypeGroups[this.formatterModule(moduleName)] || []
  }

  /**
   * Get element type by ID
   */
  getElementType(tid: string): PrintElementType | undefined {
    return this.allElementTypes.find(type => type.tid === tid)
  }

  /**
   * Format module name
   */
  private formatterModule(moduleName?: string): string {
    return moduleName || '_default'
  }

  /**
   * Build element types from HTML
   */
  buildByHtml(elements: NodeListOf<Element> | Element[]): void {
    elements.forEach((element) => {
      const tid = element.getAttribute('tid')
      if (tid) {
        const elementType = this.getElementType(tid)
        if (elementType) {
          // Initialize drag and drop for this element
          this.initializeDragAndDrop(element as HTMLElement, elementType)
        }
      }
    })
  }

  /**
   * Initialize drag and drop for an element
   */
  private initializeDragAndDrop(element: HTMLElement, elementType: PrintElementType): void {
    element.draggable = true
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer?.setData('text/plain', JSON.stringify(elementType))
    })
  }
}

export const printElementTypeManager: PrintElementTypeManager = PrintElementTypeManager.getInstance()
