import type { Dom } from '../utils/dom'
import { pt, px } from '../utils/units'

export interface DragState {
  el: HTMLElement
  proxy?: HTMLElement
  left: number
  top: number
  startLeft: number
  startTop: number
  startMouseX: number
  startMouseY: number
  moveUnit: 'pt' | 'px'
  data?: any
}

export interface DraggableOptions {
  handle?: HTMLElement | Dom
  axis?: 'x' | 'y' | ''
  moveUnit?: 'pt' | 'px'
  minMove?: number
  proxy?: 'clone' | HTMLElement | (() => HTMLElement | Dom | undefined)
  revert?: boolean
  onBeforeDrag?: (el: HTMLElement, e: MouseEvent, state: DragState) => void
  onDrag?: (el: HTMLElement, left: number, top: number, state: DragState) => void
  onStopDrag?: (el: HTMLElement, state: DragState, e: MouseEvent) => void
}

let currentDrag: DragState | null = null

export function getCurrentDrag(): DragState | null {
  return currentDrag
}

export function ptToPx(ptVal: number): number {
  return pt.toPx(ptVal)
}

export function makeDraggable(el: HTMLElement | Dom, opts: DraggableOptions = {}): () => void {
  const node = (el as any).els?.[0] as HTMLElement || (el as HTMLElement)
  const handleNode = opts.handle
    ? ((opts.handle as any).els?.[0] as HTMLElement || (opts.handle as HTMLElement))
    : node
  const moveUnit = opts.moveUnit || 'px'
  const minMove = opts.minMove || 0

  function onPointerDown(e: MouseEvent): void {
    if (e.button !== 0)
      return
    const rect = node.getBoundingClientRect()
    const startLeftPx = rect.left + window.scrollX
    const startTopPx = rect.top + window.scrollY
    const startLeft = moveUnit === 'pt' ? px.toPt(startLeftPx) : startLeftPx
    const startTop = moveUnit === 'pt' ? px.toPt(startTopPx) : startTopPx
    const state: DragState = {
      el: node,
      left: startLeft,
      top: startTop,
      startLeft,
      startTop,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      moveUnit,
    }
    currentDrag = state

    opts.onBeforeDrag?.(node, e, state)

    let proxyEl: HTMLElement | undefined
    if (opts.proxy) {
      if (opts.proxy === 'clone') {
        proxyEl = node.cloneNode(true) as HTMLElement
      }
      else if (typeof opts.proxy === 'function') {
        const result = opts.proxy()
        proxyEl = result ? ((result as any).els?.[0] as HTMLElement || (result as HTMLElement)) : undefined
      }
      else {
        proxyEl = opts.proxy
      }
      if (proxyEl) {
        proxyEl.style.position = 'absolute'
        proxyEl.style.zIndex = '99999'
        proxyEl.style.pointerEvents = 'none'
        proxyEl.style.left = `${startLeftPx}px`
        proxyEl.style.top = `${startTopPx}px`
        proxyEl.style.opacity = '0.8'
        document.body.appendChild(proxyEl)
      }
      state.proxy = proxyEl
    }
    else {
      state.proxy = node
    }

    document.addEventListener('mousemove', onPointerMove)
    document.addEventListener('mouseup', onPointerUp)
    e.preventDefault()
  }

  function onPointerMove(e: MouseEvent): void {
    if (!currentDrag)
      return
    const state = currentDrag
    let dx = e.clientX - state.startMouseX
    let dy = e.clientY - state.startMouseY
    if (moveUnit === 'pt') {
      dx = px.toPt(dx)
      dy = px.toPt(dy)
    }
    if (Math.abs(dx) < minMove && Math.abs(dy) < minMove)
      return
    let left = state.startLeft + dx
    let top = state.startTop + dy
    if (opts.axis === 'x')
      top = state.startTop
    if (opts.axis === 'y')
      left = state.startLeft
    state.left = left
    state.top = top
    if (state.proxy && state.proxy !== node) {
      state.proxy.style.left = `${moveUnit === 'pt' ? ptToPx(left) : left}px`
      state.proxy.style.top = `${moveUnit === 'pt' ? ptToPx(top) : top}px`
    }
    opts.onDrag?.(node, left, top, state)
  }

  function onPointerUp(e: MouseEvent): void {
    document.removeEventListener('mousemove', onPointerMove)
    document.removeEventListener('mouseup', onPointerUp)
    if (!currentDrag)
      return
    const state = currentDrag
    currentDrag = null
    if (state.proxy && state.proxy !== node && opts.revert !== false)
      state.proxy.remove()
    opts.onStopDrag?.(node, state, e)
    notifyDroppables(state, e)
  }

  handleNode.addEventListener('mousedown', onPointerDown)
  return () => handleNode.removeEventListener('mousedown', onPointerDown)
}

export interface DroppableOptions {
  accept?: string
  onDrop?: (droppable: HTMLElement, state: DragState, e: MouseEvent) => void
  onDragEnter?: (droppable: HTMLElement, state: DragState) => void
  onDragLeave?: (droppable: HTMLElement, state: DragState) => void
}

const droppables: Array<{ el: HTMLElement, opts: DroppableOptions }> = []

export function makeDroppable(el: HTMLElement | Dom, opts: DroppableOptions = {}): () => void {
  const node = (el as any).els?.[0] as HTMLElement || (el as HTMLElement)
  droppables.push({ el: node, opts })
  return () => {
    const idx = droppables.findIndex(d => d.el === node)
    if (idx >= 0)
      droppables.splice(idx, 1)
  }
}

function notifyDroppables(state: DragState, e: MouseEvent): void {
  const proxyRect = state.proxy?.getBoundingClientRect()
  if (!proxyRect)
    return
  const cx = proxyRect.left + proxyRect.width / 2
  const cy = proxyRect.top + proxyRect.height / 2
  droppables.forEach((d) => {
    if (d.opts.accept && !state.el.matches(d.opts.accept) && !state.el.closest(d.opts.accept))
      return
    const r = d.el.getBoundingClientRect()
    if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom)
      d.opts.onDrop?.(d.el, state, e)
  })
}
