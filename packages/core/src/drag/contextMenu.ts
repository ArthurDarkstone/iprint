import type { Dom } from '../utils/dom'
import { dom } from '../utils/dom'

export interface ContextMenuItem {
  text: string
  icon?: string
  disable?: () => boolean
  onclick?: (target: any) => void
  separator?: boolean
  submenu?: ContextMenuItem[]
}

export interface ContextMenuOptions {
  items: ContextMenuItem[]
  target?: any
}

export function showContextMenu(x: number, y: number, options: ContextMenuOptions): () => void {
  document.querySelectorAll('.hicontextmenuroot').forEach(el => el.remove())
  const root = dom('<div class="hicontextmenu hicontextmenuroot"></div>')
  root.css({ 'position': 'fixed', 'left': `${x}px`, 'top': `${y}px`, 'z-index': '999999' })
  const ul = dom('<ul></ul>')
  options.items.forEach((item) => {
    if (item.separator) {
      ul.append(dom('<li class="borderBottom"></li>'))
      return
    }
    const li = dom(`<li class="hicontextmenuitem">${item.text}</li>`)
    const updateDisabled = () => {
      const disabled = item.disable?.() ?? false
      li.toggleClass('disable', disabled)
    }
    updateDisabled()
    li.on('click', () => {
      if (li.hasClass('disable'))
        return
      item.onclick?.(options.target)
      close()
    })
    li.on('mouseenter', updateDisabled)
    if (item.submenu?.length) {
      const subUl = dom('<ul class="hicontextsubmenu"></ul>')
      item.submenu.forEach((sub) => {
        const subLi = dom(`<li class="hicontextmenuitem">${sub.text}</li>`)
        subLi.on('click', () => {
          if (subLi.hasClass('disable'))
            return
          sub.onclick?.(options.target)
          close()
        })
        subUl.append(subLi)
      })
      li.append(subUl)
    }
    ul.append(li)
  })
  root.append(ul)
  document.body.appendChild(root.get(0)!)
  function close(): void {
    root.remove()
    document.removeEventListener('click', onDocClick)
  }
  function onDocClick(): void {
    close()
  }
  setTimeout(() => document.addEventListener('click', onDocClick), 0)
  return close
}

export function attachContextMenu(el: HTMLElement | Dom, options: ContextMenuOptions | (() => ContextMenuOptions)): void {
  const node = (el as any).els?.[0] as HTMLElement || (el as HTMLElement)
  node.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault()
    const opts = typeof options === 'function' ? options() : options
    showContextMenu(e.clientX, e.clientY, { ...opts, target: node })
  })
}
