import type { ContextMenuItem } from '../drag/contextMenu'
import type { Dom } from '../utils/dom'
import { attachContextMenu } from '../drag/contextMenu'
import { pt, px } from '../utils/units'

export interface HiTableOptions {
  table: Dom
  rows: any[][]
  resizeColumn?: boolean
  resizeRow?: boolean
  isEnableEdit?: boolean
  isEnableEditText?: boolean
  isEnableEditField?: boolean
  isEnableContextMenu?: boolean
  isEnableInsertRow?: boolean
  isEnableDeleteRow?: boolean
  isEnableInsertColumn?: boolean
  isEnableDeleteColumn?: boolean
  isEnableMergeCell?: boolean
  columnResizable?: boolean
}

/**
 * Excel-like editable table editor. Faithful subset of hiprint's HiTable:
 * cell selection (click + drag), double-click to edit, column resize grips,
 * and a context menu (insert/delete row & column, align, merge/split).
 */
export class HiTable {
  table: Dom
  options: HiTableOptions
  private selectedCells: HTMLElement[] = []
  private grips: HTMLElement[] = []

  constructor(options: HiTableOptions) {
    this.options = options
    this.table = options.table
    this.table.addClass('hitable')
    this.bindCellSelection()
    if (options.isEnableEditText)
      this.bindCellEdit()
    if (options.resizeColumn && options.columnResizable !== false)
      this.createColumnGrips()
    if (options.isEnableContextMenu)
      this.bindContextMenu()
  }

  private getCells(): HTMLElement[] {
    return Array.from(this.table.find('td, th').els)
  }

  private bindCellSelection(): void {
    let isDragging = false
    let startCell: HTMLElement | null = null
    this.table.on('mousedown', (e: Event) => {
      const target = e.target as HTMLElement
      const cell = target.closest('td, th') as HTMLElement | null
      if (!cell)
        return
      isDragging = true
      startCell = cell
      this.selectSingle(cell)
    })
    this.table.on('mousemove', (e: Event) => {
      if (!isDragging || !startCell)
        return
      const target = e.target as HTMLElement
      const cell = target.closest('td, th') as HTMLElement | null
      if (cell && cell !== startCell)
        this.selectRange(startCell, cell)
    })
    document.addEventListener('mouseup', () => {
      isDragging = false
      startCell = null
    }, { once: true })
  }

  private selectSingle(cell: HTMLElement): void {
    this.clearSelection()
    cell.classList.add('selected')
    this.selectedCells = [cell]
  }

  private selectRange(start: HTMLElement, end: HTMLElement): void {
    this.clearSelection()
    const cells = this.getCells()
    const startIdx = cells.indexOf(start)
    const endIdx = cells.indexOf(end)
    if (startIdx < 0 || endIdx < 0)
      return
    const lo = Math.min(startIdx, endIdx)
    const hi = Math.max(startIdx, endIdx)
    for (let i = lo; i <= hi; i++) {
      cells[i].classList.add('selected')
      this.selectedCells.push(cells[i])
    }
  }

  private clearSelection(): void {
    this.selectedCells.forEach(c => c.classList.remove('selected'))
    this.selectedCells = []
  }

  private bindCellEdit(): void {
    this.table.on('dblclick', (e: Event) => {
      const cell = (e.target as HTMLElement).closest('td, th') as HTMLElement | null
      if (!cell)
        return
      this.beginEdit(cell)
    })
  }

  private beginEdit(cell: HTMLElement): void {
    const old = cell.textContent || ''
    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'hitable-editor-text'
    input.value = old
    cell.innerHTML = ''
    cell.appendChild(input)
    input.focus()
    input.select()
    const endEdit = () => {
      cell.innerHTML = input.value
    }
    input.addEventListener('blur', endEdit)
    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        endEdit()
      }
    })
  }

  private createColumnGrips(): void {
    const thead = this.table.find('thead')
    if (!thead.length)
      return
    const gripsContainer = document.createElement('div')
    gripsContainer.className = 'columngrips'
    gripsContainer.style.cssText = 'height:0;position:absolute;'
    this.table.get(0)?.appendChild(gripsContainer)
    const headerRow = thead.find('tr').els[0]
    if (!headerRow)
      return
    const headerCells = Array.from(headerRow.querySelectorAll('td, th'))
    headerCells.forEach((th, i) => {
      if (i === headerCells.length - 1)
        return
      const grip = document.createElement('div')
      grip.className = 'columngrip'
      grip.style.cssText = `margin-left:-5px;position:absolute;z-index:5;width:10px;height:${this.table.outerHeight()}px;cursor:col-resize;`
      const rect = (th as HTMLElement).getBoundingClientRect()
      const tableRect = this.table.get(0)!.getBoundingClientRect()
      grip.style.left = `${rect.right - tableRect.left}px`
      gripsContainer.appendChild(grip)
      this.grips.push(grip)
      let startX = 0
      let startWidth = 0
      grip.addEventListener('mousedown', (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()
        startX = ev.clientX
        startWidth = px.toPt((th as HTMLElement).getBoundingClientRect().width)
        const col = this.options.rows?.[0]?.[i]
        const onMove = (e2: MouseEvent) => {
          const width = Math.max(10, startWidth + px.toPt(e2.clientX - startX))
          if (col)
            col.width = width
          ;(th as HTMLElement).style.width = `${width}pt`
          grip.classList.add('columngripDraging')
        }
        const onUp = () => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
          grip.classList.remove('columngripDraging')
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })
    })
    void pt
  }

  updateColumnGrips(): void {
    this.grips.forEach(g => g.remove())
    this.grips = []
    if (this.options.resizeColumn && this.options.columnResizable !== false)
      this.createColumnGrips()
  }

  private bindContextMenu(): void {
    attachContextMenu(this.table, () => ({
      items: this.buildContextMenuItems(),
      target: this.table,
    }))
  }

  private buildContextMenuItems(): ContextMenuItem[] {
    const items: ContextMenuItem[] = []
    if (this.options.isEnableInsertRow) {
      items.push({ text: '在上方插入行', onclick: () => this.insertRow('above') })
      items.push({ text: '在下方插入行', onclick: () => this.insertRow('below') })
    }
    if (this.options.isEnableInsertColumn) {
      items.push({ text: '向左插入列', onclick: () => this.insertColumn('left') })
      items.push({ text: '向右插入列', onclick: () => this.insertColumn('right') })
    }
    if (this.options.isEnableDeleteRow)
      items.push({ text: '删除行', onclick: () => this.deleteRow() })
    if (this.options.isEnableDeleteColumn)
      items.push({ text: '删除列', onclick: () => this.deleteColumn() })
    if (this.options.isEnableMergeCell) {
      items.push({
        text: '合并单元格',
        onclick: () => this.mergeCells(),
        disable: () => this.selectedCells.length < 2,
      })
      items.push({
        text: '拆分单元格',
        onclick: () => this.splitCell(),
        disable: () => {
          const c = this.selectedCells[0]
          return !c || ((Number(c.getAttribute('rowspan') || 1) <= 1 && Number(c.getAttribute('colspan') || 1) <= 1))
        },
      })
    }
    return items
  }

  private insertRow(pos: 'above' | 'below'): void {
    const tbody = this.table.find('tbody')
    const trs = tbody.find('tr').els
    if (trs.length === 0)
      return
    const ref = this.selectedCells[0]?.closest('tr') as HTMLElement || trs[0]
    const newRow = (trs[0] as HTMLElement).cloneNode(true) as HTMLElement
    newRow.querySelectorAll('td').forEach(td => (td.textContent = ''))
    if (pos === 'above')
      ref.parentNode?.insertBefore(newRow, ref)
    else
      ref.parentNode?.insertBefore(newRow, ref.nextSibling)
  }

  private insertColumn(pos: 'left' | 'right'): void {
    const cell = this.selectedCells[0]
    if (!cell)
      return
    const idx = Array.from(cell.parentElement?.children || []).indexOf(cell)
    this.table.find('tr').els.forEach((tr) => {
      const newCell = document.createElement('td')
      const ref = (tr as HTMLElement).children[idx] as HTMLElement
      if (pos === 'left')
        (tr as HTMLElement).insertBefore(newCell, ref)
      else
        (tr as HTMLElement).insertBefore(newCell, ref?.nextSibling || null)
    })
  }

  private deleteRow(): void {
    const cell = this.selectedCells[0]
    const tr = cell?.closest('tr')
    tr?.remove()
  }

  private deleteColumn(): void {
    const cell = this.selectedCells[0]
    if (!cell)
      return
    const idx = Array.from(cell.parentElement?.children || []).indexOf(cell)
    this.table.find('tr').els.forEach((tr) => {
      (tr as HTMLElement).children[idx]?.remove()
    })
  }

  private mergeCells(): void {
    if (this.selectedCells.length < 2)
      return
    const first = this.selectedCells[0]
    let rows = 1
    let cols = 1
    const rowsSet = new Set<string>()
    const colsSet = new Set<number>()
    this.selectedCells.forEach((c) => {
      rowsSet.add(c.parentElement?.dataset?.row || c.parentElement?.getAttribute('data-row') || '')
      const idx = Array.from(c.parentElement?.children || []).indexOf(c)
      colsSet.add(idx)
    })
    rows = rowsSet.size
    cols = colsSet.size
    first.setAttribute('rowspan', String(rows))
    first.setAttribute('colspan', String(cols))
    this.selectedCells.slice(1).forEach(c => c.remove())
    this.clearSelection()
  }

  private splitCell(): void {
    const cell = this.selectedCells[0]
    if (!cell)
      return
    const rs = Number(cell.getAttribute('rowspan') || 1)
    const cs = Number(cell.getAttribute('colspan') || 1)
    cell.removeAttribute('rowspan')
    cell.removeAttribute('colspan')
    for (let i = 1; i < cs; i++) {
      const newCell = document.createElement('td')
      cell.parentNode?.insertBefore(newCell, cell.nextSibling)
    }
    void rs
  }

  destroy(): void {
    this.grips.forEach(g => g.remove())
    this.clearSelection()
  }
}
