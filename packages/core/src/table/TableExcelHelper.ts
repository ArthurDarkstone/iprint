import type { PrintElementOptions, TableColumn } from '../types'
import type { Dom } from '../utils/dom'
import { dom } from '../utils/dom'
import { groupBy } from '../utils/helpers'

/**
 * Faithful port of hiprint's TableExcelHelper.
 */

export interface ReconsitutionTableColumns {
  colspan: number
  totalLayer: number
  rowColumns: TableExcelColumn[]
  [layer: number]: TableExcelColumn[]
}

export interface TableExcelColumn extends TableColumn {
  id: string
  hasWidth?: boolean
  targetWidth?: number
}

function evalFn(body?: string): Function | undefined {
  if (!body)
    return undefined
  try {
    // eslint-disable-next-line no-new-func
    return new Function(`return (${body})`)()
  }
  catch (e) {
    console.warn('evalFn failed', e)
    return undefined
  }
}

export class TableExcelHelper {
  static reconsitutionTableColumnTree(t: TableColumn[][]): ReconsitutionTableColumns {
    const i: ReconsitutionTableColumns = {
      colspan: 0,
      totalLayer: 0,
      rowColumns: [] as any,
    }
    for (let r = 0; r < t.length; r++) {
      i.totalLayer = r + 1
      ;(i as any)[r] = t[r]
      if (r === 0) {
        t[r].forEach((c) => {
          i.colspan += c.colspan || 1
        })
      }
    }
    i.rowColumns = TableExcelHelper.getOrderedColumns(i)
    return i
  }

  static getOrderedColumns(t: ReconsitutionTableColumns): TableExcelColumn[] {
    const e: Record<number, TableExcelColumn[]> = {}
    for (let layer = 0; layer < t.totalLayer; layer++) {
      ;(t as any)[layer].forEach((col: TableExcelColumn) => {
        for (let i = 0; i < (col.rowspan || 1); i++) {
          const key = layer + i
          e[key] = e[key] || []
          e[key].push(col)
        }
      })
    }
    return e[t.totalLayer - 1] || []
  }

  static allAutoWidth(t: ReconsitutionTableColumns): number {
    let e = 0
    t.rowColumns.forEach((c) => {
      e += c.fixed ? 0 : (c.width || 0)
    })
    return e
  }

  static allFixedWidth(t: ReconsitutionTableColumns): number {
    let e = 0
    t.rowColumns.forEach((c) => {
      e += c.fixed ? (c.width || 0) : 0
    })
    return e
  }

  static getColumnsWidth(t: ReconsitutionTableColumns, totalWidth: number): Record<string, number> {
    const n: Record<string, number> = {}
    const auto = TableExcelHelper.allAutoWidth(t)
    const fixed = TableExcelHelper.allFixedWidth(t)
    t.rowColumns.forEach((c) => {
      if (c.fixed) {
        n[c.id] = c.width || 0
      }
      else {
        const r = totalWidth - fixed
        const a = ((c.width || 0) / auto) * (r > 0 ? r : 0)
        n[c.id] = a
      }
    })
    return n
  }

  static createTableHead(columns: TableColumn[][], totalWidth: number): Dom {
    const n = TableExcelHelper.reconsitutionTableColumnTree(columns)
    const thead = dom('<thead></thead>')
    const o = TableExcelHelper.getColumnsWidth(n, totalWidth)
    for (let layer = 0; layer < n.totalLayer; layer++) {
      const tr = dom('<tr></tr>')
      ;(n as any)[layer].forEach((t: TableExcelColumn) => {
        const td = dom('<td></td>')
        if (t.id)
          td.attr('id', t.id)
        if (t.columnId)
          td.attr('column-id', t.columnId)
        if (t.align || t.halign)
          td.css('text-align', t.halign || t.align)
        if (t.vAlign)
          td.css('vertical-align', t.vAlign)
        if ((t.colspan || 1) > 1)
          td.attr('colspan', String(t.colspan))
        if ((t.rowspan || 1) > 1)
          td.attr('rowspan', String(t.rowspan))
        td.html(t.title || '')
        if (o[t.id]) {
          t.hasWidth = true
          t.targetWidth = o[t.id]
          td.attr('haswidth', 'haswidth')
          td.css('width', `${o[t.id]}pt`)
        }
        else {
          t.hasWidth = false
        }
        tr.append(td)
      })
      thead.append(tr)
    }
    TableExcelHelper.syncTargetWidthToOption(columns)
    return thead
  }

  static syncTargetWidthToOption(columns: TableColumn[][]): void {
    columns.forEach((layer) => {
      layer.forEach((c: any) => {
        if (c.hasWidth)
          c.width = c.targetWidth
      })
    })
  }

  static getColumnFormatter(column: TableExcelColumn): Function | undefined {
    return column.formatter || evalFn(column.formatter2)
  }

  static getColumnStyler(column: TableExcelColumn): Function | undefined {
    return column.styler || evalFn(column.styler2)
  }

  static getRowStyler(options: PrintElementOptions, tablePrintElementType: any): Function | undefined {
    return tablePrintElementType?.rowStyler || evalFn(options.rowStyler as string)
  }

  static getFooterFormatter(options: PrintElementOptions, tablePrintElementType: any): Function | undefined {
    return tablePrintElementType?.footerFormatter || evalFn(options.footerFormatter as string)
  }

  static createRowTarget(t: ReconsitutionTableColumns, row: any, options: PrintElementOptions, printElementType: any): Dom {
    const tr = dom('<tr></tr>')
    ;(tr as any).els[0].__rowData__ = row
    t.rowColumns.forEach((col) => {
      const td = dom('<td></td>')
      if (col.field)
        td.attr('field', col.field)
      if (col.align)
        td.css('text-align', col.align)
      if (col.vAlign)
        td.css('vertical-align', col.vAlign)
      const formatter = TableExcelHelper.getColumnFormatter(col)
      const value = formatter ? formatter(row[col.field!], row, options, printElementType) : row[col.field!]
      td.html(value == null ? '' : String(value))
      const styler = TableExcelHelper.getColumnStyler(col)
      if (styler) {
        const styles = styler(row[col.field!], row, options, printElementType)
        if (styles)
          td.css(styles)
      }
      tr.append(td)
    })
    const rowStyler = TableExcelHelper.getRowStyler(options, printElementType)
    if (rowStyler) {
      const styles = rowStyler(row, options)
      if (styles)
        tr.css(styles)
    }
    return tr
  }

  static createTableRow(columns: TableColumn[][], data: any[], options: PrintElementOptions, printElementType: any): Dom {
    const t = TableExcelHelper.reconsitutionTableColumnTree(columns)
    const tbody = dom('<tbody></tbody>')
    const rows = data || []
    if (printElementType?.groupFields?.length) {
      groupBy(rows, printElementType.groupFields, (item: any) => {
        const e: any = {}
        printElementType.groupFields.forEach((field: string) => {
          e[field] = item[field]
        })
        return e
      }).forEach((group: any) => {
        if (printElementType.groupFormatter) {
          const groupFormatter = evalFn(printElementType.groupFormatter)
          const tr = dom(`<tr><td colspan="${t.colspan}"></td></tr>`)
          tr.find('td').append(groupFormatter?.(group, options))
          tbody.append(tr)
        }
        group.rows.forEach((row: any) => {
          tbody.append(TableExcelHelper.createRowTarget(t, row, options, printElementType))
        })
        if (printElementType.groupFooterFormatter) {
          const gff = evalFn(printElementType.groupFooterFormatter)
          const tr = dom(`<tr><td colspan="${t.colspan}"></td></tr>`)
          tr.find('td').append(gff?.(group, options))
          tbody.append(tr)
        }
      })
    }
    else {
      rows.forEach((row: any) => {
        tbody.append(TableExcelHelper.createRowTarget(t, row, options, printElementType))
      })
    }
    return tbody
  }

  static createTableFooter(columns: TableColumn[][], data: any, options: PrintElementOptions, printElementType: any, currentPage: number, currentPageRows: any[]): Dom {
    const tfoot = dom('<tfoot></tfoot>')
    const formatter = TableExcelHelper.getFooterFormatter(options, printElementType)
    if (formatter) {
      const result = formatter(options, data, currentPage, currentPageRows)
      tfoot.append(result)
    }
    return tfoot
  }

  static createEmptyRowTarget(columns: TableColumn[][]): Dom {
    const t = TableExcelHelper.reconsitutionTableColumnTree(columns)
    const tr = dom('<tr></tr>')
    t.rowColumns.forEach((col) => {
      const td = dom('<td></td>')
      if (col.field)
        td.attr('field', col.field)
      if (col.align)
        td.css('text-align', col.align)
      if (col.vAlign)
        td.css('vertical-align', col.vAlign)
      tr.append(td)
    })
    return tr
  }

  static resizeTableCellWidth(target: Dom, columns: TableColumn[][], totalWidth: number): void {
    const t = TableExcelHelper.reconsitutionTableColumnTree(columns)
    const o = TableExcelHelper.getColumnsWidth(t, totalWidth)
    target.find('thead tr td[haswidth]').each((el) => {
      const id = el.getAttribute('id')
      if (id && o[id] != null)
        dom(el).css('width', `${o[id]}pt`)
    })
  }
}

/** Ensure each column has a stable id (columnId || field || index-based). */
export function normalizeColumns(columns?: TableColumn[][]): TableColumn[][] {
  if (!columns)
    return [[{ width: 100 }]]
  return columns.map(row =>
    row.map((col) => {
      const c: any = { ...col }
      c.columnId = c.columnId || c.field || ''
      c.id = c.columnId || `col_${Math.random().toString(36).slice(2, 8)}`
      c.rowspan = c.rowspan || 1
      c.colspan = c.colspan || 1
      return c
    }),
  )
}
