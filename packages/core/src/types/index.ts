/**
 * Core types and interfaces for iprint
 */

export interface PrintElementOptions {
  left?: number
  top?: number
  width?: number
  height?: number
  title?: string
  field?: string
  fontSize?: number
  fontWeight?: string | number
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  letterSpacing?: number
  borderColor?: string
  borderWidth?: string | number
  backgroundColor?: string
  src?: string
  content?: string
  textType?: 'text' | 'barcode' | 'qrcode'
  hideTitle?: boolean
  testData?: string
  styler?: string
  formatter?: string
  dataType?: string
  [key: string]: any
}

export interface PrintElementType {
  tid: string
  title: string
  type: string
  text?: string
  field?: string
  fields?: string[]
  data?: any
  styler?: string
  formatter?: string
  options?: PrintElementOptions
  editable?: boolean
  columnDisplayEditable?: boolean
  columnDisplayIndexEditable?: boolean
  columnTitleEditable?: boolean
  columnResizable?: boolean
  columnAlignEditable?: boolean
  columns?: any[]
  rowStyler?: string
  striped?: boolean
  groupFields?: string[]
  groupFormatter?: string
  groupFooterFormatter?: string
  footerFormatter?: string
  gridColumnsFooterFormatter?: string
}

export interface PrintElementTypeGroup {
  name: string
  printElementTypes: PrintElementType[]
}

export interface PrintPanel {
  index: number
  height: number
  width: number
  paperHeader?: number
  paperFooter?: number
  printElements: PrintElement[]
  paperNumberLeft?: number
  paperNumberTop?: number
  paperNumberDisabled?: boolean
  rotate?: boolean
}

export interface PrintElement {
  options: PrintElementOptions
  printElementType: {
    title: string
    type: string
  }
}

export interface PrintTemplate {
  panels: PrintPanel[]
}

export interface IPrintConfig {
  text: PrintElementOptions
  image: PrintElementOptions
  table: PrintElementOptions
  hline: PrintElementOptions
  vline: PrintElementOptions
  rect: PrintElementOptions
  oval: PrintElementOptions
  html: PrintElementOptions
  longText: PrintElementOptions
}

export interface IPrintInitOptions {
  providers?: any[]
  [key: string]: any
}

export interface PrintData {
  [key: string]: any
}

export interface PrintResult {
  html(): string
  [key: string]: any
}
