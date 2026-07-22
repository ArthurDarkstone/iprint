import type { PrintData, PrintElementOptions, TableColumn } from '../types'
import type { Dom } from '../utils/dom'
import type { PrintElementType } from './PrintElementType'
import { HiTable } from '../table/HiTable'
import { normalizeColumns, TableExcelHelper } from '../table/TableExcelHelper'
import { dom } from '../utils/dom'
import { BasePrintElement } from './BasePrintElement'

/**
 * Data-driven table print element.
 * Phase 1 renders the full table block; row-by-row pagination (getPaperHtmlResult)
 * is implemented in Phase 2.
 */
export class TableElement extends BasePrintElement {
  public hitable?: any

  constructor(printElementType: PrintElementType, options?: PrintElementOptions) {
    super(printElementType, options)
    this.options.columns = normalizeColumns(this.options.columns as TableColumn[][])
  }

  getColumns(): TableColumn[][] {
    return this.options.columns as TableColumn[][]
  }

  getGridColumns(): number {
    return this.options.gridColumns || 1
  }

  override getData(data?: PrintData): any[] {
    if (!data)
      return [{}]
    const e = data[this.getField()]
    return e ? JSON.parse(JSON.stringify(e)) : []
  }

  getFooterFormatter(): Function | undefined {
    return this.printElementType.footerFormatter || this.options.footerFormatter
  }

  getGridColumnsFooterFormatter(): Function | undefined {
    return this.printElementType.gridColumnsFooterFormatter || this.options.gridColumnsFooterFormatter
  }

  getTableHtml(data: any[], _options?: any): Dom {
    if (!this.getField() && this.options.content) {
      const wrapper = dom('<div></div>')
      wrapper.append(this.options.content)
      const table = wrapper.find('table')
      table.addClass('hiprint-printElement-tableTarget')
      return table
    }
    if (this.printElementType.formatter) {
      const wrapper = dom('<div></div>')
      wrapper.append((this.printElementType as any).formatter(data))
      const table = wrapper.find('table')
      table.addClass('hiprint-printElement-tableTarget')
      return table
    }
    const table = dom('<table class="hiprint-printElement-tableTarget" style="border-collapse: collapse;"></table>')
    table.append(TableExcelHelper.createTableHead(this.getColumns(), (this.options.width || 550) / this.getGridColumns()))
    table.append(TableExcelHelper.createTableRow(this.getColumns(), data, this.options, this.printElementType))
    if (this.getFooterFormatter()) {
      if (this.options.tableFooterRepeat === 'no') {
        // skip footer
      }
      else if (this.options.tableFooterRepeat === 'last') {
        table.find('tbody').append(TableExcelHelper.createTableFooter(this.printElementType.columns || this.getColumns(), data, this.options, this.printElementType, 0, data).html())
      }
      else {
        table.append(TableExcelHelper.createTableFooter(this.printElementType.columns || this.getColumns(), data, this.options, this.printElementType, 0, []))
      }
    }
    return table
  }

  createGridColumnsStructure(data?: any): { gridColumns: number, target: Dom, getByIndex: (i: number) => Dom } {
    const target = dom('<div class="hi-grid-row table-grid-row"></div>')
    const n = this.getGridColumns()
    for (let i = 0; i < n; i++)
      target.append(dom(`<div class="tableGridColumnsGutterRow hi-grid-col" style="width:${100 / n}%;"></div>`))
    const gcf = this.getGridColumnsFooterFormatter()
    if (gcf) {
      const footer = dom('<div class="hiprint-gridColumnsFooter"></div>')
      footer.append(gcf(this.options, this.getData(data), data, []))
      target.append(footer)
    }
    const cols = target.children('.tableGridColumnsGutterRow').els
    return {
      gridColumns: n,
      target,
      getByIndex: (i: number) => dom(cols[i]),
    }
  }

  createTarget(title: string, data: any[]): Dom {
    const target = dom('<div class="hiprint-printElement hiprint-printElement-table" style="position: absolute;"><div class="hiprint-printElement-table-handle"></div><div class="hiprint-printElement-table-content" style="height:100%;width:100%"></div></div>')
    const grid = this.createGridColumnsStructure(data)
    for (let r = 0; r < grid.gridColumns; r++)
      grid.getByIndex(r).append(this.getTableHtml(data, {}))
    target.find('.hiprint-printElement-table-content').append(grid.target)
    return target
  }

  override css(target: Dom, data: PrintData): void {
    if ((this.getField() || !this.options.content) && !this.printElementType.formatter)
      super.css(target, data)
  }

  override getReizeableShowPoints(): string[] {
    return ['s', 'e']
  }

  setHitable(): void {
    const tableEl = this.designTarget?.find('.hiprint-printElement-tableTarget').els[0]
    if (!tableEl)
      return
    this.hitable = new HiTable({
      table: dom(tableEl),
      rows: this.getColumns(),
      resizeColumn: true,
      isEnableEdit: this.printElementType.editable,
      isEnableEditText: true,
      isEnableContextMenu: this.printElementType.editable,
      isEnableInsertRow: this.printElementType.type === 'tableCustom',
      isEnableDeleteRow: this.printElementType.type === 'tableCustom',
      isEnableInsertColumn: this.printElementType.type === 'tableCustom',
      isEnableDeleteColumn: this.printElementType.type === 'tableCustom',
      isEnableMergeCell: this.printElementType.type === 'tableCustom',
      columnResizable: true,
    })
  }

  override design(paper: Dom, options?: any): void {
    super.design(paper, options)
    if (this.printElementType.editable)
      this.setHitable()
  }

  override getHtml(paper: any, data?: PrintData, _options?: any): any[] {
    this.setCurrenttemplateData(data)
    const value = this.getData(data)
    const target = this.createTarget(this.getTitle(), value)
    this.updateTargetSize(target)
    this.css(target, value)
    return [{
      target,
      printLine: (this.options.top || 0) + (this.options.height || 100),
    }]
  }

  override getHtml2(paper: any, data?: PrintData, options?: any): any[] {
    return this.getHtml(paper, data, options)
  }
}
