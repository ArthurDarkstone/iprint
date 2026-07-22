import type { Dom } from '../utils/dom'
import { dom } from '../utils/dom'

export interface OptionItemContext {
  printElement: any
  options: any
  printElementType: any
}

export abstract class BaseOptionItem {
  name: string
  label: string
  protected target!: Dom
  protected ctx?: OptionItemContext

  constructor(name: string, label: string) {
    this.name = name
    this.label = label
  }

  createTarget(ctx: OptionItemContext): Dom {
    this.ctx = ctx
    const wrap = dom(`<div class="hiprint-option-item"><div class="hiprint-option-item-label">${this.label}</div><div class="hiprint-option-item-field"></div></div>`)
    const field = wrap.find('.hiprint-option-item-field')
    const input = this.buildField(ctx)
    field.append(input)
    this.target = wrap
    this.setValue(ctx.options[this.name], ctx.options, ctx.printElementType)
    return wrap
  }

  abstract buildField(ctx: OptionItemContext): Dom

  abstract getValue(): any

  abstract setValue(value: any, options: any, printElementType: any): void

  destroy(): void {
    this.target?.remove()
  }
}

export interface SelectOption {
  value: string | number
  text: string
}

export class SelectOptionItem extends BaseOptionItem {
  protected options: SelectOption[]
  protected numeric = false

  constructor(name: string, label: string, options: SelectOption[], numeric = false) {
    super(name, label)
    this.options = options
    this.numeric = numeric
  }

  buildField(_ctx: OptionItemContext): Dom {
    const select = dom('<select class="auto-submit"></select>')
    select.append(dom('<option value="">默认</option>'))
    this.options.forEach((opt) => {
      select.append(dom(`<option value="${opt.value}">${opt.text}</option>`))
    })
    return select
  }

  getValue(): any {
    const val = (this.target.find('select').val() as string) || ''
    if (val === '')
      return undefined
    return this.numeric ? Number.parseFloat(val) : val
  }

  setValue(value: any, _options: any, _printElementType: any): void {
    if (value == null)
      return
    const v = String(value)
    if (!this.target.find(`option[value="${v}"]`).length)
      this.target.find('select').prepend(dom(`<option value="${v}">${v}</option>`))
    this.target.find('select').val(v)
  }
}

export class TextOptionItem extends BaseOptionItem {
  buildField(_ctx: OptionItemContext): Dom {
    return dom('<input type="text" class="auto-submit">')
  }

  getValue(): any {
    const val = this.target.find('input').val() as string
    return val === '' ? undefined : val
  }

  setValue(value: any, _options: any, _printElementType: any): void {
    this.target.find('input').val(value == null ? '' : String(value))
  }
}

export class TextareaOptionItem extends BaseOptionItem {
  buildField(_ctx: OptionItemContext): Dom {
    return dom('<textarea class="auto-submit" rows="3"></textarea>')
  }

  getValue(): any {
    const val = this.target.find('textarea').val() as string
    return val === '' ? undefined : val
  }

  setValue(value: any, _options: any, _printElementType: any): void {
    this.target.find('textarea').val(value == null ? '' : String(value))
  }
}

export class NumericOptionItem extends BaseOptionItem {
  buildField(_ctx: OptionItemContext): Dom {
    return dom('<input type="number" class="auto-submit">')
  }

  getValue(): any {
    const val = this.target.find('input').val() as string
    if (val === '')
      return undefined
    return Number.parseFloat(val)
  }

  setValue(value: any, _options: any, _printElementType: any): void {
    this.target.find('input').val(value == null ? '' : String(value))
  }
}

export class ColorOptionItem extends BaseOptionItem {
  buildField(_ctx: OptionItemContext): Dom {
    const field = dom('<div style="display:flex;align-items:center;gap:4px;"></div>')
    field.append(dom('<input type="color" class="auto-submit" style="width:30px;height:19pt;padding:0;border:1px solid #999;">'))
    field.append(dom('<input type="text" class="auto-submit" style="flex:1;">'))
    const colorInput = field.find('input[type="color"]')
    const textInput = field.find('input[type="text"]')
    colorInput.on('input', () => {
      textInput.val(colorInput.val() as string)
    })
    textInput.on('input', () => {
      const v = textInput.val() as string
      if (/^#[0-9a-f]{6}$/i.test(v))
        colorInput.val(v)
    })
    return field
  }

  getValue(): any {
    const val = this.target.find('input[type="text"]').val() as string
    return val === '' ? undefined : val
  }

  setValue(value: any, _options: any, _printElementType: any): void {
    const v = value == null ? '' : String(value)
    this.target.find('input[type="text"]').val(v)
    if (/^#[0-9a-f]{6}$/i.test(v))
      this.target.find('input[type="color"]').val(v)
  }
}

export class SeparatorOptionItem extends BaseOptionItem {
  buildField(_ctx: OptionItemContext): Dom {
    return dom('')
  }

  createTarget(_ctx: OptionItemContext): Dom {
    const wrap = dom(`<div class="hiprint-option-item-row hiprint-option-item-label">${this.label}</div>`)
    this.target = wrap
    return wrap
  }

  getValue(): any {
    return undefined
  }

  setValue(_value: any, _options: any, _printElementType: any): void {}
}

/**
 * Columns option item — placeholder. The full column checkbox + drag-reorder UI
 * is wired in Phase 5 (table editor). For now it is a no-op so the table options
 * panel still renders.
 */
export class ColumnsOptionItem extends BaseOptionItem {
  buildField(_ctx: OptionItemContext): Dom {
    return dom('<div class="hiprint-option-table-selected-columns"></div>')
  }

  getValue(): any {
    return undefined
  }

  setValue(_value: any, _options: any, _printElementType: any): void {}
}

export type { Dom }
