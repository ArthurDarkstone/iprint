import type { PrintData, PrintPanel, PrintResult, PrintTemplate as PrintTemplateType } from '../types'
import { event } from '../utils'

/**
 * Print template class for managing print layouts
 */
export class PrintTemplate {
  private template: PrintTemplateType
  private settingContainer?: string
  private paginationContainer?: string
  private panels: PrintPanel[] = []

  constructor(options: {
    template?: PrintTemplateType
    settingContainer?: string
    paginationContainer?: string
  } = {}) {
    this.template = options.template || { panels: [] }
    this.settingContainer = options.settingContainer
    this.paginationContainer = options.paginationContainer
    this.panels = this.template.panels || []
  }

  /**
   * Add a print panel to the template
   */
  addPrintPanel(options: {
    width: number
    height: number
    paperHeader?: number
    paperFooter?: number
  }): PrintPanel {
    const panel: PrintPanel = {
      index: this.panels.length,
      height: options.height,
      width: options.width,
      paperHeader: options.paperHeader,
      paperFooter: options.paperFooter,
      printElements: [],
    }

    this.panels.push(panel)
    return panel
  }

  /**
   * Design the template in the specified container
   */
  design(container: string | HTMLElement): void {
    const containerElement = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

    if (!containerElement) {
      console.error('Container element not found')
      return
    }

    // Clear existing content
    containerElement.innerHTML = ''

    // Create panels
    this.panels.forEach((panel, index) => {
      const panelElement = this.createPanelElement(panel, index)
      containerElement.appendChild(panelElement)
    })

    // Initialize drag and drop functionality
    this.initializeDragAndDrop(containerElement)
  }

  /**
   * Get HTML representation of the template
   */
  getHtml(data?: PrintData): PrintResult {
    const result = document.createElement('div')
    result.className = 'iprint-template-result'

    this.panels.forEach((panel, index) => {
      const panelElement = this.createPanelElement(panel, index, data)
      result.appendChild(panelElement)
    })

    return {
      html: () => result.outerHTML,
    }
  }

  /**
   * Print the template
   */
  print(data?: PrintData): void {
    const html = this.getHtml(data)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body { margin: 0; padding: 20px; }
              .iprint-template-result { width: 100%; }
            </style>
          </head>
          <body>
            ${html.html()}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  /**
   * Print by HTML element
   */
  printByHtml(element: HTMLElement | any): void {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const htmlContent = element instanceof HTMLElement
        ? element.outerHTML
        : element.html()

      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body { margin: 0; padding: 20px; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  /**
   * Get JSON representation of the template
   */
  getJson(): PrintTemplateType {
    return {
      panels: this.panels.map(panel => ({
        ...panel,
        printElements: panel.printElements.map(element => ({
          options: { ...element.options },
          printElementType: { ...element.printElementType },
        })),
      })),
    }
  }

  /**
   * Set paper size
   */
  setPaper(paperTypeOrWidth: string | number, height?: number): void {
    if (typeof paperTypeOrWidth === 'string') {
      const paperSizes: Record<string, { width: number, height: number }> = {
        A3: { width: 297, height: 420 },
        A4: { width: 210, height: 297 },
        A5: { width: 148, height: 210 },
        B3: { width: 353, height: 500 },
        B4: { width: 250, height: 353 },
        B5: { width: 176, height: 250 },
      }

      const size = paperSizes[paperTypeOrWidth]
      if (size) {
        this.panels.forEach((panel) => {
          panel.width = size.width
          panel.height = size.height
        })
      }
    }
    else if (typeof paperTypeOrWidth === 'number' && height) {
      this.panels.forEach((panel) => {
        panel.width = paperTypeOrWidth
        panel.height = height
      })
    }

    event.trigger('iprintTemplateDataChanged')
  }

  /**
   * Rotate paper
   */
  rotatePaper(): void {
    this.panels.forEach((panel) => {
      const temp = panel.width
      panel.width = panel.height
      panel.height = temp
    })
    event.trigger('iprintTemplateDataChanged')
  }

  /**
   * Clear the template
   */
  clear(): void {
    this.panels = []
    event.trigger('iprintTemplateDataChanged')
  }

  /**
   * Create panel element
   */
  private createPanelElement(panel: PrintPanel, index: number, data?: PrintData): HTMLElement {
    const panelElement = document.createElement('div')
    panelElement.className = 'iprint-panel'
    panelElement.style.position = 'relative'
    panelElement.style.width = `${panel.width}mm`
    panelElement.style.height = `${panel.height}mm`
    panelElement.style.border = '1px solid #ccc'
    panelElement.style.margin = '10px'
    panelElement.style.pageBreakAfter = 'always'

    // Create print elements
    panel.printElements.forEach((element) => {
      const elementDiv = this.createPrintElement(element, data)
      panelElement.appendChild(elementDiv)
    })

    return panelElement
  }

  /**
   * Create print element
   */
  private createPrintElement(element: any, _data?: PrintData): HTMLElement {
    const elementDiv = document.createElement('div')
    elementDiv.className = `iprint-printElement iprint-printElement-${element.printElementType.type}`
    elementDiv.style.position = 'absolute'
    elementDiv.style.left = `${element.options.left || 0}pt`
    elementDiv.style.top = `${element.options.top || 0}pt`
    elementDiv.style.width = `${element.options.width || 100}pt`
    elementDiv.style.height = `${element.options.height || 20}pt`

    // Set content based on element type
    switch (element.printElementType.type) {
      case 'text':
        elementDiv.textContent = element.options.title || ''
        elementDiv.style.fontSize = `${element.options.fontSize || 12}px`
        elementDiv.style.color = element.options.color || '#000000'
        elementDiv.style.textAlign = element.options.textAlign || 'left'
        break
      case 'image':
        elementDiv.style.backgroundImage = `url(${element.options.src || ''})`
        elementDiv.style.backgroundSize = 'contain'
        elementDiv.style.backgroundRepeat = 'no-repeat'
        elementDiv.style.backgroundPosition = 'center'
        break
      case 'hline':
        elementDiv.style.borderTop = `${element.options.borderWidth || 1}px solid ${element.options.borderColor || '#000000'}`
        break
      case 'vline':
        elementDiv.style.borderLeft = `${element.options.borderWidth || 1}px solid ${element.options.borderColor || '#000000'}`
        break
      case 'rect':
        elementDiv.style.border = `${element.options.borderWidth || 1}px solid ${element.options.borderColor || '#000000'}`
        elementDiv.style.backgroundColor = element.options.backgroundColor || 'transparent'
        break
      case 'oval':
        elementDiv.style.border = `${element.options.borderWidth || 1}px solid ${element.options.borderColor || '#000000'}`
        elementDiv.style.borderRadius = '50%'
        elementDiv.style.backgroundColor = element.options.backgroundColor || 'transparent'
        break
    }

    return elementDiv
  }

  /**
   * Initialize drag and drop functionality
   */
  private initializeDragAndDrop(_container: HTMLElement): void {
    // This would implement the drag and drop functionality
    // For now, it's a placeholder
    console.log('Drag and drop initialization would go here')
  }

  /**
   * Event handling
   */
  on(eventName: string, callback: Function): void {
    event.on(eventName, callback)
  }

  off(eventName: string, callback: Function): void {
    event.off(eventName, callback)
  }
}
