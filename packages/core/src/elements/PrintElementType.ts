import type { PrintElementOptions, PrintElementTypeConfig, PrintElementTypeName } from '../types'
import { config } from '../config'
import { CustomTableElement } from './CustomTableElement'
import { HtmlElement } from './HtmlElement'
import { ImageElement } from './ImageElement'
import { HLineElement, VLineElement } from './LineElement'
import { LongTextElement } from './LongTextElement'
import { OvalElement, RectElement } from './ShapeElement'
import { TableElement } from './TableElement'
import { TextElement } from './TextElement'

/**
 * Describes a print element type and can instantiate its element.
 * Mirrors hiprint's PrintElementType / createPrintElementType dispatch.
 */
export class PrintElementType {
  tid: string
  title: string
  type: PrintElementTypeName
  text?: string
  field?: string
  fields?: string[]
  data?: any
  custom?: boolean
  customText?: string
  editable?: boolean
  columns?: any[][]
  groupFields?: string[]
  groupFormatter?: string
  groupFooterFormatter?: string
  footerFormatter?: string
  gridColumnsFooterFormatter?: string
  formatter?: string
  styler?: string
  rowStyler?: string
  striped?: boolean
  columnDisplayEditable?: boolean
  columnDisplayIndexEditable?: boolean
  columnTitleEditable?: boolean
  columnResizable?: boolean
  columnAlignEditable?: boolean
  options: PrintElementOptions

  constructor(cfg: PrintElementTypeConfig) {
    this.tid = cfg.tid
    this.title = cfg.title ?? cfg.text ?? ''
    this.type = cfg.type
    this.text = cfg.text
    this.field = cfg.field
    this.fields = cfg.fields
    this.data = cfg.data
    this.custom = cfg.custom
    this.customText = cfg.customText
    this.editable = cfg.editable
    this.columns = cfg.columns
    this.groupFields = cfg.groupFields
    this.groupFormatter = cfg.groupFormatter
    this.groupFooterFormatter = cfg.groupFooterFormatter
    this.footerFormatter = cfg.footerFormatter
    this.gridColumnsFooterFormatter = cfg.gridColumnsFooterFormatter
    this.formatter = cfg.formatter
    this.styler = cfg.styler
    this.rowStyler = cfg.rowStyler
    this.striped = cfg.striped
    this.columnDisplayEditable = cfg.columnDisplayEditable
    this.columnDisplayIndexEditable = cfg.columnDisplayIndexEditable
    this.columnTitleEditable = cfg.columnTitleEditable
    this.columnResizable = cfg.columnResizable
    this.columnAlignEditable = cfg.columnAlignEditable
    this.options = { ...(cfg.options || {}) }
  }

  /**
   * Default options = config defaults for this type merged with provider `options`.
   */
  getDefaults(): PrintElementOptions {
    return { ...config.getDefaults(this.type), ...this.options }
  }

  createPrintElement(options?: PrintElementOptions): any {
    const opts = { ...this.getDefaults(), ...(options || {}) }
    switch (this.type) {
      case 'text':
        return new TextElement(this, opts)
      case 'table':
        return new TableElement(this, opts)
      case 'tableCustom':
        return new CustomTableElement(this, opts)
      case 'image':
        return new ImageElement(this, opts)
      case 'longText':
        return new LongTextElement(this, opts)
      case 'hline':
        return new HLineElement(this, opts)
      case 'vline':
        return new VLineElement(this, opts)
      case 'rect':
        return new RectElement(this, opts)
      case 'oval':
        return new OvalElement(this, opts)
      case 'html':
        return new HtmlElement(this, opts)
      default:
        return new TextElement(this, opts)
    }
  }
}

/**
 * Factory mirroring hiprint's nt.createPrintElementType.
 */
export function createPrintElementType(cfg: PrintElementTypeConfig | PrintElementType): PrintElementType {
  if (cfg instanceof PrintElementType)
    return cfg
  return new PrintElementType(cfg)
}
