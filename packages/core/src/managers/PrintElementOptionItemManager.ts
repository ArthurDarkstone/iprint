import type { SupportOption } from '../types'

export interface OptionItem {
  name: string
  createTarget: (printElement: any, options: any, printElementType: any) => any
  getValue: () => any
  setValue: (value: any, options: any, printElementType: any) => void
  css?: (target: any, value: any) => any
  destroy?: () => void
}

export type OptionItemFactory = () => OptionItem

/**
 * Registry for option items. Items are registered as factories so each render
 * gets a fresh instance (avoiding shared DOM-target state).
 */
export class PrintElementOptionItemManager {
  private static instance: PrintElementOptionItemManager
  private factories: Record<string, OptionItemFactory> = {}

  private constructor() {}

  static getInstance(): PrintElementOptionItemManager {
    if (!PrintElementOptionItemManager.instance) {
      PrintElementOptionItemManager.instance = new PrintElementOptionItemManager()
    }
    return PrintElementOptionItemManager.instance
  }

  registerItem(name: string, factory: OptionItemFactory): void {
    this.factories[name] = factory
  }

  registerItems(items: Array<{ name: string, factory: OptionItemFactory }>): void {
    items.forEach(({ name, factory }) => this.registerItem(name, factory))
  }

  hasItem(name: string): boolean {
    return !!this.factories[name]
  }

  createItem(name: string): OptionItem | undefined {
    const factory = this.factories[name]
    return factory ? factory() : undefined
  }

  buildItems(names: Array<SupportOption | string>): OptionItem[] {
    return names
      .map(n => (typeof n === 'string' ? { name: n, hidden: false } : n))
      .filter(n => !n.hidden && this.hasItem(n.name))
      .map(n => this.createItem(n.name)!)
      .filter(Boolean)
  }
}

export const printElementOptionItemManager: PrintElementOptionItemManager = PrintElementOptionItemManager.getInstance()
