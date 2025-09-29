import type { IPrintConfig, PrintElementOptions } from '../types'

/**
 * Default configuration for iprint
 */
export const defaultConfig: IPrintConfig = {
  text: {
    left: 0,
    top: 0,
    width: 100,
    height: 20,
    title: '文本',
    fontSize: 12,
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 16,
    letterSpacing: 0,
    hideTitle: false,
  },
  image: {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    src: '',
    hideTitle: false,
  },
  table: {
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    content: '',
    hideTitle: false,
    isEnableEdit: true,
    isEnableContextMenu: true,
    isEnableEditField: true,
    isEnableInsertRow: true,
    isEnableDeleteRow: true,
    isEnableInsertColumn: true,
    isEnableDeleteColumn: true,
    isEnableMergeCell: true,
    columnResizable: true,
    columnAlignEditable: true,
  },
  hline: {
    left: 0,
    top: 0,
    width: 100,
    height: 1,
    borderColor: '#000000',
    borderWidth: 1,
  },
  vline: {
    left: 0,
    top: 0,
    width: 1,
    height: 100,
    borderColor: '#000000',
    borderWidth: 1,
  },
  rect: {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    borderColor: '#000000',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  oval: {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    borderColor: '#000000',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  html: {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    content: '',
    hideTitle: false,
  },
  longText: {
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    title: '长文本',
    fontSize: 12,
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 16,
    letterSpacing: 0,
    hideTitle: false,
  },
}

/**
 * Configuration manager for iprint
 */
export class ConfigManager {
  private static instance: ConfigManager
  private config: IPrintConfig

  private constructor() {
    this.config = { ...defaultConfig }
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  init(config?: Partial<IPrintConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  get(elementType: keyof IPrintConfig): PrintElementOptions {
    return this.config[elementType]
  }

  set(elementType: keyof IPrintConfig, options: PrintElementOptions): void {
    this.config[elementType] = { ...this.config[elementType], ...options }
  }

  getAll(): IPrintConfig {
    return { ...this.config }
  }
}

export const config: ConfigManager = ConfigManager.getInstance()
