import type { ElementTypeCatalog, IPrintConfig, PrintElementTypeName } from '../types'
import { getPaperSize } from './paperSizes'

export * from './paperSizes'

function so(names: string[]): { name: string, hidden: boolean }[] {
  return names.map(name => ({ name, hidden: false }))
}

/**
 * Full option catalog per element type, ported 1:1 from demo/hiprint/hiprint.config.js
 */
export const defaultConfig: IPrintConfig = {
  text: {
    supportOptions: so([
      'title',
      'field',
      'testData',
      'dataType',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'color',
      'textDecoration',
      'textAlign',
      'textContentVerticalAlign',
      'lineHeight',
      'textType',
      'barcodeMode',
      'hideTitle',
      'showInPage',
      'unShowInPage',
      'fixed',
      'axis',
      'transform',
      'optionsGroup',
      'borderLeft',
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderWidth',
      'borderColor',
      'contentPaddingLeft',
      'contentPaddingTop',
      'contentPaddingRight',
      'contentPaddingBottom',
      'backgroundColor',
      'formatter',
      'styler',
    ]),
    default: { width: 120, height: 9.75 },
  },
  image: {
    supportOptions: so([
      'field',
      'src',
      'showInPage',
      'fixed',
      'axis',
      'transform',
      'formatter',
      'styler',
    ]),
    default: {},
  },
  longText: {
    supportOptions: so([
      'title',
      'field',
      'testData',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'textAlign',
      'lineHeight',
      'color',
      'hideTitle',
      'longTextIndent',
      'leftSpaceRemoved',
      'showInPage',
      'unShowInPage',
      'fixed',
      'axis',
      'lHeight',
      'transform',
      'optionsGroup',
      'borderLeft',
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderWidth',
      'borderColor',
      'contentPaddingLeft',
      'contentPaddingTop',
      'contentPaddingRight',
      'contentPaddingBottom',
      'backgroundColor',
      'formatter',
      'styler',
    ]),
    default: { height: 42, width: 550 },
  },
  table: {
    supportOptions: so([
      'field',
      'fontFamily',
      'fontSize',
      'lineHeight',
      'textAlign',
      'gridColumns',
      'gridColumnsGutter',
      'tableBorder',
      'tableHeaderBorder',
      'tableHeaderCellBorder',
      'tableHeaderRowHeight',
      'tableHeaderBackground',
      'tableHeaderFontSize',
      'tableHeaderFontWeight',
      'tableBodyRowHeight',
      'tableBodyRowBorder',
      'tableBodyCellBorder',
      'axis',
      'lHeight',
      'autoCompletion',
      'columns',
      'styler',
      'rowStyler',
      'tableFooterRepeat',
      'footerFormatter',
      'gridColumnsFooterFormatter',
    ]),
    default: { width: 550 },
  },
  tableCustom: {
    supportOptions: so([
      'field',
      'fontFamily',
      'fontSize',
      'textAlign',
      'tableBorder',
      'tableHeaderBorder',
      'tableHeaderCellBorder',
      'tableHeaderRowHeight',
      'tableHeaderFontSize',
      'tableHeaderFontWeight',
      'tableHeaderBackground',
      'tableBodyRowHeight',
      'tableBodyRowBorder',
      'tableBodyCellBorder',
      'axis',
      'lHeight',
      'autoCompletion',
      'tableFooterRepeat',
    ]),
    default: { width: 550 },
  },
  hline: {
    supportOptions: so([
      'borderColor',
      'borderWidth',
      'showInPage',
      'fixed',
      'axis',
      'transform',
      'borderStyle',
    ]),
    default: { borderWidth: 0.75, height: 9, width: 90 },
  },
  vline: {
    supportOptions: so([
      'borderColor',
      'borderWidth',
      'showInPage',
      'fixed',
      'axis',
      'transform',
      'borderStyle',
    ]),
    default: { borderWidth: undefined, height: 90, width: 9 },
  },
  rect: {
    supportOptions: so([
      'borderColor',
      'borderWidth',
      'showInPage',
      'fixed',
      'axis',
      'transform',
      'borderStyle',
    ]),
    default: { borderWidth: undefined, height: 90, width: 90 },
  },
  oval: {
    supportOptions: so([
      'borderColor',
      'borderWidth',
      'showInPage',
      'fixed',
      'axis',
      'transform',
      'borderStyle',
    ]),
    default: { borderWidth: undefined, height: 90, width: 90 },
  },
  html: {
    supportOptions: so([
      'showInPage',
      'unShowInPage',
      'fixed',
      'axis',
      'formatter',
    ]),
    default: { height: 90, width: 90 },
  },
  tableColumn: {
    supportOptions: so([
      'title',
      'align',
      'halign',
      'vAlign',
      'paddingLeft',
      'paddingRight',
      'formatter2',
      'styler2',
    ]),
    default: { height: 90, width: 90 },
  },
}

/**
 * Configuration manager for iprint
 */
export class ConfigManager {
  private static instance: ConfigManager
  private config: IPrintConfig
  movingDistance = 1.5
  paperHeightTrim = 1

  private constructor() {
    this.config = JSON.parse(JSON.stringify(defaultConfig)) as IPrintConfig
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  init(options?: Partial<IPrintConfig> & { movingDistance?: number, paperHeightTrim?: number }): void {
    if (options) {
      const { movingDistance, paperHeightTrim, ...rest } = options
      if (movingDistance !== undefined)
        this.movingDistance = movingDistance
      if (paperHeightTrim !== undefined)
        this.paperHeightTrim = paperHeightTrim
      this.config = { ...this.config, ...rest }
    }
  }

  getCatalog(elementType: PrintElementTypeName | string): ElementTypeCatalog {
    return this.config[elementType] || { supportOptions: [], default: {} }
  }

  get(elementType: PrintElementTypeName | string): ElementTypeCatalog {
    return this.getCatalog(elementType)
  }

  getDefaults(elementType: PrintElementTypeName | string): Record<string, any> {
    return { ...(this.getCatalog(elementType).default || {}) }
  }

  set(elementType: PrintElementTypeName | string, catalog: Partial<ElementTypeCatalog>): void {
    this.config[elementType] = { ...this.config[elementType], ...catalog }
  }

  getPaperSize(name: string): { width: number, height: number } | undefined {
    return getPaperSize(name)
  }

  getAll(): IPrintConfig {
    return JSON.parse(JSON.stringify(this.config)) as IPrintConfig
  }
}

export const config: ConfigManager = ConfigManager.getInstance()
