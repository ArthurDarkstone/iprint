import type { GetHtmlOptions, PrintData, PrintPanelEntity, PrintTemplateEntity } from '../types'
import type { Dom } from '../utils/dom'
import { getPaperSize } from '../config'
import { PrintElementTypeManager } from '../managers/PrintElementTypeManager'
import { dom, isDom } from '../utils/dom'
import { event } from '../utils/event'
import { guid } from '../utils/guid'
import { PrintPanel } from './PrintPanel'

export interface PrintTemplateOptions {
  template?: PrintTemplateEntity
  settingContainer?: string
  paginationContainer?: string
  fields?: string[]
  autoSave?: boolean
  autoSaveKey?: string
  autoSaveMode?: number
}

/**
 * Print template: a collection of panels. Mirrors hiprint's PrintTemplate (class ct).
 */
export class PrintTemplate {
  id: string
  printPanels: PrintPanel[] = []
  fields: string[]
  settingContainer?: string
  paginationContainer?: string
  container?: Dom
  optionSetting?: any
  editingPanel?: PrintPanel
  autoSave?: boolean
  autoSaveKey: string
  autoSaveMode: number

  constructor(options: PrintTemplateOptions = {}) {
    this.id = guid()
    this.settingContainer = options.settingContainer
    this.paginationContainer = options.paginationContainer
    this.fields = options.fields || []
    this.autoSave = options.autoSave
    this.autoSaveKey = options.autoSaveKey || 'hiprintAutoSave'
    this.autoSaveMode = options.autoSaveMode || 1
    const panels = options.template?.panels || []
    if (panels.length === 0)
      panels.push(PrintPanel.createDefaultPanel(this.id))
    panels.forEach((panel) => {
      const printPanel = new PrintPanel(panel, this.id)
      this.printPanels.push(printPanel)
    })
    if (this.autoSave)
      this.initAutoSave()
  }

  addPrintPanel(panelOptions?: Partial<PrintPanelEntity>, autoDesign = false): PrintPanel {
    const entity: PrintPanelEntity = {
      index: this.printPanels.length,
      width: panelOptions?.width ?? 210,
      height: panelOptions?.height ?? 297,
      paperHeader: panelOptions?.paperHeader ?? 0,
      paperFooter: panelOptions?.paperFooter,
      printElements: [],
    } as PrintPanelEntity
    const panel = new PrintPanel(entity, this.id)
    this.printPanels.push(panel)
    if (autoDesign && this.container)
      this.design(this.container)
    event.trigger(`iprintTemplateDataChanged_${this.id}`)
    return panel
  }

  design(container: string | HTMLElement | Dom, options?: any): void {
    this.container = isDom(container) ? container : dom(container as any)
    this.container.empty()
    this.printPanels.forEach((panel) => {
      panel.design(options)
      this.container!.append(panel.getTarget())
    })
    this.selectPanel(0)
    if (this.settingContainer) {
      import('../optionItems/PrintElementOptionSetting').then(({ PrintElementOptionSetting }) => {
        this.optionSetting = new PrintElementOptionSetting(this, this.settingContainer!)
      })
    }
  }

  selectPanel(index: number): void {
    this.printPanels.forEach((panel, i) => {
      if (i === index) {
        panel.enable()
        this.editingPanel = panel
      }
      else {
        panel.disable()
      }
    })
  }

  deletePanel(index: number): void {
    const panel = this.printPanels[index]
    if (panel) {
      panel.clear()
      this.printPanels.splice(index, 1)
    }
  }

  getPaneltotal(): number {
    return this.printPanels.length
  }

  getPanel(index = 0): PrintPanel | undefined {
    return this.printPanels[index]
  }

  getHtml(data?: PrintData, options?: GetHtmlOptions): Dom {
    const result = dom('<div class="hiprint-printTemplate"></div>')
    const dataArray = Array.isArray(data) ? data : [data]
    dataArray.forEach((d) => {
      this.printPanels.forEach((panel) => {
        result.append(panel.getHtml(d, options))
      })
    })
    return result
  }

  getSimpleHtml(data?: PrintData, options?: GetHtmlOptions): Dom {
    return this.getHtml(data, options)
  }

  getJointHtml(data?: PrintData, options?: GetHtmlOptions, _extra?: any): Dom {
    return this.getHtml(data, options)
  }

  getJson(): PrintTemplateEntity {
    return {
      panels: this.printPanels.map(panel => panel.getPanelEntity(false)),
    }
  }

  getJsonTid(): PrintTemplateEntity {
    return {
      panels: this.printPanels.map(panel => panel.getPanelEntity(true)),
    }
  }

  setPaper(paperTypeOrWidth: string | number, height?: number): void {
    const panel = this.editingPanel || this.printPanels[0]
    if (!panel)
      return
    if (typeof paperTypeOrWidth === 'string') {
      const size = getPaperSize(paperTypeOrWidth)
      if (size) {
        panel.resize(paperTypeOrWidth, size.width, size.height)
      }
    }
    else if (typeof paperTypeOrWidth === 'number' && height) {
      panel.resize(undefined, paperTypeOrWidth, height)
    }
    event.trigger(`iprintTemplateDataChanged_${this.id}`)
  }

  rotatePaper(): void {
    const panel = this.editingPanel || this.printPanels[0]
    panel?.rotatePaper()
    event.trigger(`iprintTemplateDataChanged_${this.id}`)
  }

  clear(): void {
    const panel = this.editingPanel || this.printPanels[0]
    panel?.clear()
    event.trigger(`iprintTemplateDataChanged_${this.id}`)
  }

  getPaperType(index = 0): string | undefined {
    return this.printPanels[index]?.paperType
  }

  getOrient(index = 0): 1 | 2 {
    const panel = this.printPanels[index]
    if (!panel)
      return 1
    return panel.height >= panel.width ? 1 : 2
  }

  getPrintStyle(index = 0): string {
    return this.printPanels[index]?.getPrintSizeStyle() || ''
  }

  deletePrintElement(printElement: any): void {
    this.printPanels.forEach((panel) => {
      const idx = panel.printElements.indexOf(printElement)
      if (idx >= 0)
        panel.printElements.splice(idx, 1)
    })
    event.trigger(`iprintTemplateDataChanged_${this.id}`)
  }

  getElementByTid(tid: string, panelIndex = 0): any[] {
    return this.printPanels[panelIndex]?.getElementByTid(tid) || []
  }

  getElementByName(name: string, panelIndex = 0): any[] {
    return this.printPanels[panelIndex]?.getElementByName(name) || []
  }

  getFields(): string[] {
    return this.fields
  }

  setFields(fields: string[]): void {
    this.fields = fields
  }

  getFieldsInPanel(): string[] {
    const fields: string[] = []
    this.printPanels.forEach((panel) => {
      panel.getFieldsInPanel().forEach((f) => {
        if (!fields.includes(f))
          fields.push(f)
      })
    })
    return fields
  }

  print(data?: PrintData, options?: GetHtmlOptions): void {
    const html = this.getHtml(data, options)
    browserPrint(html)
  }

  printByHtml(html: Dom | string): void {
    browserPrint(isDom(html) ? html : dom(html as any))
  }

  async print2(_data?: PrintData, _options?: GetHtmlOptions): Promise<void> {
    const { print2 } = await import('../print/webSocket')
    return print2(this, _data, _options)
  }

  async printByHtml2(_html: Dom | string, _options?: GetHtmlOptions): Promise<void> {
    const { printByHtml2 } = await import('../print/webSocket')
    return printByHtml2(this, isDom(_html) ? _html : dom(_html as any), _options)
  }

  async toPdf(data: PrintData, filename: string, options?: any): Promise<void> {
    const { toPdf } = await import('../print/pdfExport')
    return toPdf(this, data, filename, options)
  }

  on(eventName: string, handler: Function): void {
    event.on(`${eventName}_${this.id}`, handler as any)
  }

  off(eventName: string, handler: Function): void {
    event.off(`${eventName}_${this.id}`, handler as any)
  }

  clientIsOpened(): boolean {
    return false
  }

  getPrinterList(): any[] {
    return []
  }

  initAutoSave(): void {
    event.on(`iprintTemplateDataChanged_${this.id}`, () => {
      try {
        const json = this.autoSaveMode === 1 ? this.getJson() : this.getJsonTid()
        localStorage.setItem(this.autoSaveKey, JSON.stringify(json))
      }
      catch (e) {
        console.warn('autoSave failed', e)
      }
    })
  }

  imageToBase64(): void {
    // Implemented in Phase 6 (print/imageBase64) — converts <img> to base64 for socket/PDF.
  }

  getPrintElementTypeManager(): PrintElementTypeManager {
    return PrintElementTypeManager.getInstance()
  }
}

/**
 * Basic browser print via hidden iframe. Phase 6 wires the full hiwprint plugin.
 */
function browserPrint(html: Dom): void {
  const existing = document.getElementById('hiwprint_iframe')
  existing?.remove()
  const iframe = document.createElement('iframe')
  iframe.id = 'hiwprint_iframe'
  iframe.style.cssText = 'visibility:hidden;height:0;width:0;position:absolute'
  document.body.appendChild(iframe)
  const printCss = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => {
      if (node.tagName === 'STYLE')
        return `<style>${node.textContent}</style>`
      return (node as HTMLLinkElement).outerHTML
    })
    .join('\n')
  const doc = iframe.contentWindow?.document
  if (!doc)
    return
  doc.open()
  doc.write(`<!DOCTYPE html><html><head>${printCss}</head><body>${(html as any).els?.[0]?.outerHTML || ''}</body></html>`)
  doc.close()
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    }, 300)
  }
}
