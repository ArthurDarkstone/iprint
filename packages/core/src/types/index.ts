/**
 * Core types and interfaces for iprint
 */

export type PrintElementTypeName =
  | 'text'
  | 'image'
  | 'longText'
  | 'table'
  | 'tableCustom'
  | 'hline'
  | 'vline'
  | 'rect'
  | 'oval'
  | 'html'
  | 'tableColumn'

export type TextType = '' | 'text' | 'barcode' | 'qrcode'

export type BarcodeMode =
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'CODE39'
  | 'EAN-13'
  | 'EAN-8'
  | 'EAN-5'
  | 'EAN-2'
  | 'UPC'
  | 'ITF'
  | 'ITF-14'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'Pharmacode'

export type BorderStyle = 'solid' | 'dotted' | 'dashed'

export interface PrintElementOptions {
  // geometry
  left?: number
  top?: number
  width?: number
  height?: number
  // text-ish
  title?: string
  field?: string
  name?: string
  testData?: string
  dataType?: string
  format?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string | number
  letterSpacing?: number
  color?: string
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textContentVerticalAlign?: 'top' | 'middle' | 'bottom'
  lineHeight?: number
  textType?: TextType
  barcodeMode?: BarcodeMode
  hideTitle?: boolean
  showInPage?: 'first' | 'odd' | 'even' | 'last' | number | number[]
  unShowInPage?: 'first' | 'last' | number
  fixed?: boolean
  axis?: 'v' | 'h' | ''
  transform?: number
  optionsGroup?: string
  // borders / bg
  borderLeft?: BorderStyle | 'none'
  borderTop?: BorderStyle | 'none'
  borderRight?: BorderStyle | 'none'
  borderBottom?: BorderStyle | 'none'
  borderWidth?: number
  borderColor?: string
  borderStyle?: BorderStyle
  contentPaddingLeft?: number
  contentPaddingTop?: number
  contentPaddingRight?: number
  contentPaddingBottom?: number
  backgroundColor?: string
  // code hooks (string bodies, eval'd via new Function)
  formatter?: string
  styler?: string
  rowStyler?: string
  footerFormatter?: string
  gridColumnsFooterFormatter?: string
  // longText
  longTextIndent?: number
  leftSpaceRemoved?: boolean
  lHeight?: number
  // image
  src?: string
  // html
  content?: string
  // table
  columns?: TableColumn[][]
  gridColumns?: number
  gridColumnsGutter?: number
  tableBorder?: 'default' | 'border' | 'noBorder'
  tableHeaderBorder?: 'default' | 'border' | 'noBorder'
  tableHeaderCellBorder?: 'default' | 'border' | 'noBorder'
  tableHeaderRowHeight?: number
  tableHeaderBackground?: string
  tableHeaderFontSize?: number
  tableHeaderFontWeight?: string | number
  tableBodyRowHeight?: number
  tableBodyRowBorder?: 'default' | 'border' | 'noBorder' | 'top' | 'bottom' | 'topBottom'
  tableBodyCellBorder?: 'default' | 'border' | 'noBorder'
  autoCompletion?: boolean
  tableFooterRepeat?: '' | 'no' | 'page' | 'last'
  [key: string]: any
}

export interface TableColumn {
  width?: number
  title?: string
  descTitle?: string
  field?: string
  fixed?: boolean
  rowspan?: number
  colspan?: number
  align?: 'left' | 'center' | 'right' | 'justify'
  halign?: 'left' | 'center' | 'right' | 'justify'
  vAlign?: 'top' | 'middle' | 'bottom'
  formatter?: string
  styler?: string
  formatter2?: string
  styler2?: string
  checkbox?: boolean
  checked?: boolean
  columnId?: string
  tableSummary?: boolean
  summaryFormatter?: string
  [key: string]: any
}

export interface PrintElementTypeConfig {
  tid: string
  title: string
  type: PrintElementTypeName
  text?: string
  field?: string
  fields?: string[]
  data?: any
  styler?: string
  formatter?: string
  options?: PrintElementOptions
  editable?: boolean
  custom?: boolean
  customText?: string
  columnDisplayEditable?: boolean
  columnDisplayIndexEditable?: boolean
  columnTitleEditable?: boolean
  columnResizable?: boolean
  columnAlignEditable?: boolean
  columns?: TableColumn[][]
  rowStyler?: string
  striped?: boolean
  groupFields?: string[]
  groupFormatter?: string
  groupFooterFormatter?: string
  footerFormatter?: string
  gridColumnsFooterFormatter?: string
  [key: string]: any
}

export interface SupportOption {
  name: string
  hidden?: boolean
}

export interface ElementTypeCatalog {
  supportOptions: SupportOption[]
  default: PrintElementOptions
}

export interface PrintElementTypeGroup {
  name: string
  printElementTypes: any[]
}

export interface PrintElement {
  options: PrintElementOptions
  printElementType: {
    tid?: string
    title: string
    type: PrintElementTypeName
    [key: string]: any
  }
}

export interface PrintPanelEntity {
  index: number
  width: number
  height: number
  paperType?: string
  paperHeader?: number
  paperFooter?: number
  paperNumberLeft?: number
  paperNumberTop?: number
  paperNumberDisabled?: boolean
  paperNumberFormat?: string
  panelPaperRule?: 'odd' | 'even'
  rotate?: boolean
  firstPaperFooter?: number
  evenPaperFooter?: number
  oddPaperFooter?: number
  lastPaperFooter?: number
  topOffset?: number
  leftOffset?: number
  fontFamily?: string
  orient?: 1 | 2
  printElements: PrintElement[]
  [key: string]: any
}

export interface PrintTemplateEntity {
  panels: PrintPanelEntity[]
}

export interface PrintResult {
  html: () => string
  outerHTML?: string
  hiwprint?: (options?: any) => void
  [key: string]: any
}

export interface PrintElementTypeGroupLike {
  name: string
  printElementTypes: PrintElementTypeConfig[]
}

export interface IPrintConfig {
  text: ElementTypeCatalog
  image: ElementTypeCatalog
  table: ElementTypeCatalog
  tableCustom: ElementTypeCatalog
  longText: ElementTypeCatalog
  hline: ElementTypeCatalog
  vline: ElementTypeCatalog
  rect: ElementTypeCatalog
  oval: ElementTypeCatalog
  html: ElementTypeCatalog
  tableColumn: ElementTypeCatalog
  [key: string]: ElementTypeCatalog
}

export interface IPrintInitOptions {
  providers?: any[]
  movingDistance?: number
  paperHeightTrim?: number
  optionItems?: any[]
  [key: string]: any
}

export interface PrintData {
  [key: string]: any
}

export interface GetHtmlOptions {
  imgToBase64?: boolean
  leftOffset?: number
  topOffset?: number
  paperNumberToggleInEven?: boolean
}

export interface DesignOptions {
  axisEnabled?: boolean
}
