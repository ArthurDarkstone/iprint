import type { PrintTemplate } from '../template/PrintTemplate'
import type { Dom } from '../utils/dom'
import { printElementOptionItemManager } from '../managers/PrintElementOptionItemManager'
import { dom, isDom } from '../utils/dom'
import { event } from '../utils/event'

const PANEL_FIELDS = [
  'panelPaperRule',
  'firstPaperFooter',
  'evenPaperFooter',
  'oddPaperFooter',
  'lastPaperFooter',
  'leftOffset',
  'topOffset',
  'fontFamily',
  'orient',
  'paperNumberFormat',
  'paperNumberDisabled',
]

/**
 * Renders the per-element options panel (and the panel-level settings form)
 * into the PrintTemplate's settingContainer. Mirrors hiprint's class ut.
 */
export class PrintElementOptionSetting {
  template: PrintTemplate
  container: Dom
  private currentItems: any[] = []

  constructor(template: PrintTemplate, container: string | HTMLElement | Dom) {
    this.template = template
    this.container = isDom(container) ? container : dom(container as any)
    event.on(`PrintElementSelectEventKey_${template.id}`, (payload: any) => {
      this.showElement(payload?.printElement)
    })
    event.on(`BuildCustomOptionSettingEventKey_${template.id}`, (payload: any) => {
      this.showPanel(payload?.options, payload?.callback)
    })
  }

  private clear(): void {
    this.currentItems.forEach((item: any) => item.destroy?.())
    this.currentItems = []
    this.container.empty()
  }

  showElement(printElement: any): void {
    this.clear()
    if (!printElement)
      return
    const wrap = dom('<div class="hiprint-option-items"></div>')
    const items = printElement.getPrintElementOptionItems?.() || []
    this.currentItems = items
    items.forEach((item: any) => {
      const target = item.createTarget({
        printElement,
        options: printElement.options,
        printElementType: printElement.printElementType,
      })
      wrap.append(target)
    })
    const submitBtn = dom('<button class="hiprint-option-item-settingBtn hiprint-option-item-submitBtn">确定</button>')
    const deleteBtn = dom('<button class="hiprint-option-item-settingBtn hiprint-option-item-deleteBtn">删除</button>')
    submitBtn.on('click', () => printElement.submitOption())
    deleteBtn.on('click', () => {
      this.template.deletePrintElement(printElement)
      this.clear()
    })
    wrap.append(submitBtn, deleteBtn)
    this.container.append(wrap)

    wrap.find('.auto-submit').each((el) => {
      el.addEventListener('change', () => printElement.submitOption())
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter')
          printElement.submitOption()
      })
    })
  }

  showPanel(options: any, callback: (vals: any) => void): void {
    this.clear()
    const wrap = dom('<div class="hiprint-option-items"></div>')
    PANEL_FIELDS.forEach((name) => {
      const item = printElementOptionItemManager.createItem(name)
      if (!item)
        return
      this.currentItems.push(item)
      const target = item.createTarget({ printElement: null, options, printElementType: null })
      item.setValue(options[name], options, null)
      target.find('input,select,textarea').each((el) => {
        el.addEventListener('change', () => {
          callback({ ...options, [name]: item.getValue() })
        })
      })
      wrap.append(target)
    })
    const submitBtn = dom('<button class="hiprint-option-item-settingBtn hiprint-option-item-submitBtn">确定</button>')
    submitBtn.on('click', () => callback({ ...options }))
    wrap.append(submitBtn)
    this.container.append(wrap)
  }
}
