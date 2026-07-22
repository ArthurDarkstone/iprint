import type { Dom } from '../utils/dom'
import { dom } from '../utils/dom'
import { px } from '../utils/units'

export interface ResizeableOptions {
  showPoints?: string[]
  minResize?: number
  noContainer?: boolean
  onBeforeResize?: (el: HTMLElement) => void
  onResize?: (el: HTMLElement, width: number, height: number, top: number, left: number) => void
  onStopResize?: (el: HTMLElement) => void
}

const HANDLE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const

const HANDLE_POSITION: Record<string, Partial<Record<'top' | 'left' | 'right' | 'bottom' | 'cursor', string>>> = {
  n: { top: '-3px', left: '50%', cursor: 'ns-resize' },
  s: { bottom: '-3px', left: '50%', cursor: 'ns-resize' },
  e: { right: '-3px', top: '50%', cursor: 'ew-resize' },
  w: { left: '-3px', top: '50%', cursor: 'ew-resize' },
  ne: { top: '-3px', right: '-3px', cursor: 'nesw-resize' },
  nw: { top: '-3px', left: '-3px', cursor: 'nwse-resize' },
  se: { bottom: '-3px', right: '-3px', cursor: 'nwse-resize' },
  sw: { bottom: '-3px', left: '-3px', cursor: 'nesw-resize' },
}

export function makeResizable(el: HTMLElement | Dom, opts: ResizeableOptions = {}): () => void {
  const node = (el as any).els?.[0] as HTMLElement || (el as HTMLElement)
  const showPoints = opts.showPoints || ['s', 'e']
  const minResize = opts.minResize || 0
  const handles: HTMLElement[] = []

  showPoints.forEach((dir) => {
    const pos = HANDLE_POSITION[dir]
    if (!pos)
      return
    const handle = document.createElement('div')
    handle.className = `hiprint-resize-handle hiprint-resize-handle-${dir}`
    handle.style.position = 'absolute'
    handle.style.width = '8px'
    handle.style.height = '8px'
    handle.style.zIndex = '10'
    handle.style.transform = 'translate(-50%, -50%)'
    Object.entries(pos).forEach(([k, v]) => {
      (handle.style as any)[k] = v
    })
    node.appendChild(handle)
    handles.push(handle)

    const startResize = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      opts.onBeforeResize?.(node)
      const startRect = node.getBoundingClientRect()
      const startW = px.toPt(startRect.width)
      const startH = px.toPt(startRect.height)
      const startLeft = px.toPt(startRect.left + window.scrollX)
      const startTop = px.toPt(startRect.top + window.scrollY)
      const startX = e.clientX
      const startY = e.clientY

      const onMove = (ev: MouseEvent) => {
        const dx = px.toPt(ev.clientX - startX)
        const dy = px.toPt(ev.clientY - startY)
        if (Math.abs(dx) < minResize && Math.abs(dy) < minResize)
          return
        let width = startW
        let height = startH
        let top = startTop
        let left = startLeft
        if (dir.includes('e'))
          width = startW + dx
        if (dir.includes('s'))
          height = startH + dy
        if (dir.includes('w')) {
          width = startW - dx
          left = startLeft + dx
        }
        if (dir.includes('n')) {
          height = startH - dy
          top = startTop + dy
        }
        if (width < minResize)
          width = minResize
        if (height < minResize)
          height = minResize
        opts.onResize?.(node, width, height, top, left)
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        opts.onStopResize?.(node)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
    handle.addEventListener('mousedown', startResize)
  })

  return () => {
    handles.forEach(h => h.remove())
  }
}

export function createResizePanel(target: Dom): Dom {
  const panel = dom('<div class="resize-panel"></div>')
  panel.css({ 'position': 'absolute', 'inset': '0', 'pointer-events': 'none' })
  target.append(panel)
  return panel
}

export { HANDLE_DIRECTIONS }
