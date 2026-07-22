import type { OptionItem } from '../managers/PrintElementOptionItemManager'
import type { SelectOption } from './base'
import {
  ColorOptionItem,
  ColumnsOptionItem,
  NumericOptionItem,
  SelectOptionItem,
  SeparatorOptionItem,
  TextareaOptionItem,
  TextOptionItem,
} from './base'

function range(start: number, end: number, step: number, unit?: string): SelectOption[] {
  const result: SelectOption[] = []
  for (let v = start; v <= end + 1e-9; v += step)
    result.push({ value: Number(v.toFixed(2)), text: `${Number(v.toFixed(2))}${unit || ''}` })
  return result
}

const FONT_FAMILY: SelectOption[] = [
  { value: 'SimSun', text: '宋体' },
  { value: 'Microsoft YaHei', text: '微软雅黑' },
]

const FONT_SIZE = range(6, 21.75, 0.75, 'pt')
const FONT_WEIGHT: SelectOption[] = [
  { value: 'lighter', text: 'lighter' },
  { value: 'normal', text: 'normal' },
  { value: 'bold', text: 'bold' },
  { value: 'bolder', text: 'bolder' },
  ...[100, 200, 300, 400, 500, 600, 700, 800, 900].map(n => ({ value: n, text: String(n) })),
]
const LETTER_SPACING = range(0.75, 12, 0.75, 'pt')
const LINE_HEIGHT = range(6, 36, 0.75, 'pt')
const LONG_TEXT_INDENT = range(6, 36, 0.75, 'pt')
const TEXT_ALIGN: SelectOption[] = [
  { value: 'left', text: '左' },
  { value: 'center', text: '左右居中' },
  { value: 'right', text: '右' },
  { value: 'justify', text: '两端对齐' },
]
const TEXT_DECORATION: SelectOption[] = [
  { value: 'underline', text: '下划线' },
  { value: 'overline', text: '上划线' },
  { value: 'line-through', text: '删除线' },
]
const V_ALIGN: SelectOption[] = [
  { value: 'top', text: '顶部' },
  { value: 'middle', text: '中部' },
  { value: 'bottom', text: '底部' },
]
const TEXT_TYPE: SelectOption[] = [
  { value: 'text', text: '文本' },
  { value: 'barcode', text: '条形码' },
  { value: 'qrcode', text: '二维码' },
]
const BARCODE_MODE: SelectOption[] = [
  'CODE128A',
  'CODE128B',
  'CODE128C',
  'CODE39',
  'EAN-13',
  'EAN-8',
  'EAN-5',
  'EAN-2',
  'UPC',
  'ITF',
  'ITF-14',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'Pharmacode',
].map(m => ({ value: m, text: m }))
const SHOW_IN_PAGE: SelectOption[] = [
  { value: 'first', text: '首页' },
  { value: 'odd', text: '奇数页' },
  { value: 'even', text: '偶数页' },
  { value: 'last', text: '末页' },
]
const UN_SHOW_IN_PAGE: SelectOption[] = [
  { value: 'first', text: '首页' },
  { value: 'last', text: '末页' },
]
const AXIS: SelectOption[] = [
  { value: 'v', text: '垂直' },
  { value: 'h', text: '水平' },
]
const BORDER_SIDE: SelectOption[] = [
  { value: 'none', text: '无' },
  { value: 'solid', text: '实线' },
  { value: 'dotted', text: '虚线' },
  { value: 'dashed', text: '破折' },
]
const BORDER_STYLE = BORDER_SIDE
const GRID_COLUMNS: SelectOption[] = [
  { value: 2, text: '2' },
  { value: 3, text: '3' },
  { value: 4, text: '4' },
]
const GRID_GUTTER = range(1.5, 9, 0.75, 'pt')
const TABLE_BORDER: SelectOption[] = [
  { value: 'default', text: '默认' },
  { value: 'border', text: '有边框' },
  { value: 'noBorder', text: '无边框' },
]
const TABLE_BODY_ROW_BORDER: SelectOption[] = [
  { value: 'default', text: '默认' },
  { value: 'border', text: '有边框' },
  { value: 'noBorder', text: '无边框' },
  { value: 'top', text: '上边框' },
  { value: 'bottom', text: '下边框' },
  { value: 'topBottom', text: '上下边框' },
]
const TABLE_FOOTER_REPEAT: SelectOption[] = [
  { value: 'no', text: '不显示' },
  { value: 'page', text: '每页显示' },
  { value: 'last', text: '仅末页' },
]
const BOOL: SelectOption[] = [
  { value: 'true', text: '是' },
  { value: 'false', text: '否' },
]
const DATETIME_FORMATS: SelectOption[] = [
  { value: 'yyyy-MM-dd', text: 'yyyy-MM-dd' },
  { value: 'yyyy-MM-dd HH:mm:ss', text: 'yyyy-MM-dd HH:mm:ss' },
  { value: 'yyyy/MM/dd', text: 'yyyy/MM/dd' },
  { value: 'yyyy年MM月dd日', text: 'yyyy年MM月dd日' },
  { value: 'HH:mm', text: 'HH:mm' },
  { value: 'HH:mm:ss', text: 'HH:mm:ss' },
]
const PANEL_RULE: SelectOption[] = [
  { value: 'odd', text: '保持奇数' },
  { value: 'even', text: '保持偶数' },
]
const PAPER_NUMBER_DISABLED: SelectOption[] = [
  { value: 'false', text: '启用' },
  { value: 'true', text: '禁用' },
]
const ORIENT: SelectOption[] = [
  { value: 1, text: '纵向' },
  { value: 2, text: '横向' },
]

export function createDefaultOptionItemFactories(): Array<{ name: string, factory: () => OptionItem }> {
  const items: Array<{ name: string, factory: () => OptionItem }> = [
    { name: 'title', factory: () => new TextareaOptionItem('title', '标题') },
    { name: 'field', factory: () => new TextOptionItem('field', '字段') },
    { name: 'testData', factory: () => new TextOptionItem('testData', '测试数据') },
    { name: 'dataType', factory: () => new SelectOptionItem('dataType', '数据类型', [{ value: 'datetime', text: '日期' }, { value: 'boolean', text: '布尔' }]) },
    { name: 'format', factory: () => new SelectOptionItem('format', '格式', DATETIME_FORMATS) },
    { name: 'fontFamily', factory: () => new SelectOptionItem('fontFamily', '字体', FONT_FAMILY) },
    { name: 'fontSize', factory: () => new SelectOptionItem('fontSize', '字体大小', FONT_SIZE, true) },
    { name: 'fontWeight', factory: () => new SelectOptionItem('fontWeight', '字体粗细', FONT_WEIGHT) },
    { name: 'letterSpacing', factory: () => new SelectOptionItem('letterSpacing', '字间距', LETTER_SPACING, true) },
    { name: 'color', factory: () => new ColorOptionItem('color', '字体颜色') },
    { name: 'textDecoration', factory: () => new SelectOptionItem('textDecoration', '文本修饰', TEXT_DECORATION) },
    { name: 'textAlign', factory: () => new SelectOptionItem('textAlign', '文本对齐', TEXT_ALIGN) },
    { name: 'textContentVerticalAlign', factory: () => new SelectOptionItem('textContentVerticalAlign', '垂直对齐', V_ALIGN) },
    { name: 'lineHeight', factory: () => new SelectOptionItem('lineHeight', '行高', LINE_HEIGHT, true) },
    { name: 'textType', factory: () => new SelectOptionItem('textType', '文本类型', TEXT_TYPE) },
    { name: 'barcodeMode', factory: () => new SelectOptionItem('barcodeMode', '条码类型', BARCODE_MODE) },
    { name: 'hideTitle', factory: () => new SelectOptionItem('hideTitle', '隐藏标题', BOOL) },
    { name: 'showInPage', factory: () => new SelectOptionItem('showInPage', '显示页', SHOW_IN_PAGE) },
    { name: 'unShowInPage', factory: () => new SelectOptionItem('unShowInPage', '不显示页', UN_SHOW_IN_PAGE) },
    { name: 'fixed', factory: () => new SelectOptionItem('fixed', '固定', BOOL) },
    { name: 'axis', factory: () => new SelectOptionItem('axis', '轴向锁定', AXIS) },
    { name: 'transform', factory: () => new NumericOptionItem('transform', '旋转(度)') },
    { name: 'optionsGroup', factory: () => new SeparatorOptionItem('optionsGroup', '边框设置') },
    { name: 'borderLeft', factory: () => new SelectOptionItem('borderLeft', '左边框', BORDER_SIDE) },
    { name: 'borderTop', factory: () => new SelectOptionItem('borderTop', '上边框', BORDER_SIDE) },
    { name: 'borderRight', factory: () => new SelectOptionItem('borderRight', '右边框', BORDER_SIDE) },
    { name: 'borderBottom', factory: () => new SelectOptionItem('borderBottom', '下边框', BORDER_SIDE) },
    { name: 'borderWidth', factory: () => new NumericOptionItem('borderWidth', '边框宽度') },
    { name: 'borderColor', factory: () => new ColorOptionItem('borderColor', '边框颜色') },
    { name: 'contentPaddingLeft', factory: () => new NumericOptionItem('contentPaddingLeft', '左内边距') },
    { name: 'contentPaddingTop', factory: () => new NumericOptionItem('contentPaddingTop', '上内边距') },
    { name: 'contentPaddingRight', factory: () => new NumericOptionItem('contentPaddingRight', '右内边距') },
    { name: 'contentPaddingBottom', factory: () => new NumericOptionItem('contentPaddingBottom', '下内边距') },
    { name: 'backgroundColor', factory: () => new ColorOptionItem('backgroundColor', '背景颜色') },
    { name: 'formatter', factory: () => new TextareaOptionItem('formatter', 'formatter') },
    { name: 'styler', factory: () => new TextareaOptionItem('styler', 'styler') },
    { name: 'longTextIndent', factory: () => new SelectOptionItem('longTextIndent', '缩进', LONG_TEXT_INDENT, true) },
    { name: 'leftSpaceRemoved', factory: () => new SelectOptionItem('leftSpaceRemoved', '去除左空格', BOOL) },
    { name: 'lHeight', factory: () => new NumericOptionItem('lHeight', '最小高度') },
    { name: 'src', factory: () => new TextOptionItem('src', '图片地址') },
    { name: 'gridColumns', factory: () => new SelectOptionItem('gridColumns', '一行多组', GRID_COLUMNS, true) },
    { name: 'gridColumnsGutter', factory: () => new SelectOptionItem('gridColumnsGutter', '组间距', GRID_GUTTER, true) },
    { name: 'tableBorder', factory: () => new SelectOptionItem('tableBorder', '表格边框', TABLE_BORDER) },
    { name: 'tableHeaderBorder', factory: () => new SelectOptionItem('tableHeaderBorder', '表头边框', TABLE_BORDER) },
    { name: 'tableHeaderCellBorder', factory: () => new SelectOptionItem('tableHeaderCellBorder', '表头单元格', TABLE_BORDER) },
    { name: 'tableHeaderRowHeight', factory: () => new NumericOptionItem('tableHeaderRowHeight', '表头行高') },
    { name: 'tableHeaderBackground', factory: () => new ColorOptionItem('tableHeaderBackground', '表头背景') },
    { name: 'tableHeaderFontSize', factory: () => new SelectOptionItem('tableHeaderFontSize', '表头字号', FONT_SIZE, true) },
    { name: 'tableHeaderFontWeight', factory: () => new SelectOptionItem('tableHeaderFontWeight', '表头粗细', FONT_WEIGHT) },
    { name: 'tableBodyRowHeight', factory: () => new NumericOptionItem('tableBodyRowHeight', '表体行高') },
    { name: 'tableBodyRowBorder', factory: () => new SelectOptionItem('tableBodyRowBorder', '表体行边框', TABLE_BODY_ROW_BORDER) },
    { name: 'tableBodyCellBorder', factory: () => new SelectOptionItem('tableBodyCellBorder', '表体单元格', TABLE_BORDER) },
    { name: 'autoCompletion', factory: () => new SelectOptionItem('autoCompletion', '自动补齐', BOOL) },
    { name: 'tableFooterRepeat', factory: () => new SelectOptionItem('tableFooterRepeat', '脚注重复', TABLE_FOOTER_REPEAT) },
    { name: 'rowStyler', factory: () => new TextareaOptionItem('rowStyler', 'rowStyler') },
    { name: 'footerFormatter', factory: () => new TextareaOptionItem('footerFormatter', 'footerFormatter') },
    { name: 'gridColumnsFooterFormatter', factory: () => new TextareaOptionItem('gridColumnsFooterFormatter', 'gridColumnsFooterFormatter') },
    { name: 'borderStyle', factory: () => new SelectOptionItem('borderStyle', '边框样式', BORDER_STYLE) },
    { name: 'align', factory: () => new SelectOptionItem('align', '对齐', TEXT_ALIGN) },
    { name: 'halign', factory: () => new SelectOptionItem('halign', '表头对齐', TEXT_ALIGN) },
    { name: 'vAlign', factory: () => new SelectOptionItem('vAlign', '垂直对齐', V_ALIGN) },
    { name: 'paddingLeft', factory: () => new SelectOptionItem('paddingLeft', '左内边距', range(0.75, 21.75, 0.75, 'pt'), true) },
    { name: 'paddingRight', factory: () => new SelectOptionItem('paddingRight', '右内边距', range(0.75, 21.75, 0.75, 'pt'), true) },
    { name: 'formatter2', factory: () => new TextareaOptionItem('formatter2', 'formatter2') },
    { name: 'styler2', factory: () => new TextareaOptionItem('styler2', 'styler2') },
    { name: 'panelPaperRule', factory: () => new SelectOptionItem('panelPaperRule', '页面规则', PANEL_RULE) },
    { name: 'firstPaperFooter', factory: () => new NumericOptionItem('firstPaperFooter', '首页页脚') },
    { name: 'evenPaperFooter', factory: () => new NumericOptionItem('evenPaperFooter', '偶数页脚') },
    { name: 'oddPaperFooter', factory: () => new NumericOptionItem('oddPaperFooter', '奇数页脚') },
    { name: 'lastPaperFooter', factory: () => new NumericOptionItem('lastPaperFooter', '末页页脚') },
    { name: 'leftOffset', factory: () => new NumericOptionItem('leftOffset', '左偏移') },
    { name: 'topOffset', factory: () => new NumericOptionItem('topOffset', '上偏移') },
    { name: 'orient', factory: () => new SelectOptionItem('orient', '方向', ORIENT, true) },
    { name: 'paperNumberFormat', factory: () => new TextOptionItem('paperNumberFormat', '页码格式') },
    { name: 'paperNumberDisabled', factory: () => new SelectOptionItem('paperNumberDisabled', '页码', PAPER_NUMBER_DISABLED) },
    { name: 'columns', factory: () => new ColumnsOptionItem() },
  ]
  return items
}
