/**
 * Tiny jQuery-like DOM wrapper so hiprint code can be ported faithfully
 * without depending on jQuery. Covers the subset hiprint uses.
 */

type Selector = string | HTMLElement | Document | Window | null | undefined | Node | Node[]
type EventHandler = (e: Event, ...args: any[]) => any

function parseHTML(html: string): HTMLElement[] {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return Array.from(template.content.childNodes).filter(
    (n): n is HTMLElement => n.nodeType === 1,
  )
}

function toCamel(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function toKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
}

export class Dom {
  els: HTMLElement[]

  constructor(els: HTMLElement[] = []) {
    this.els = els
  }

  get length(): number {
    return this.els.length
  }

  get(index = 0): HTMLElement | undefined {
    return this.els[index]
  }

  [Symbol.iterator](): Iterator<HTMLElement> {
    let i = 0
    const els = this.els
    return {
      next(): IteratorResult<HTMLElement> {
        if (i < els.length)
          return { value: els[i++], done: false }
        return { value: undefined as any, done: true }
      },
    }
  }

  each(fn: (el: HTMLElement, i: number) => void): this {
    this.els.forEach((el, i) => fn(el, i))
    return this
  }

  map<T>(fn: (el: HTMLElement, i: number) => T): T[] {
    return this.els.map((el, i) => fn(el, i))
  }

  find(selector: string): Dom {
    const found: HTMLElement[] = []
    this.els.forEach((el) => {
      el.querySelectorAll<HTMLElement>(selector).forEach((n) => {
        found.push(n)
      })
    })
    return new Dom(found)
  }

  children(selector?: string): Dom {
    const found: HTMLElement[] = []
    this.els.forEach((el) => {
      Array.from(el.children).forEach((c) => {
        if (c.nodeType === 1) {
          const ce = c as HTMLElement
          if (!selector || ce.matches(selector))
            found.push(ce)
        }
      })
    })
    return new Dom(found)
  }

  parent(): Dom {
    return new Dom(this.els.map(el => el.parentElement).filter((x): x is HTMLElement => !!x))
  }

  closest(selector: string): Dom {
    return new Dom(
      this.els
        .map(el => el.closest<HTMLElement>(selector))
        .filter((x): x is HTMLElement => !!x),
    )
  }

  addClass(cls: string): this {
    this.els.forEach((el) => {
      cls.split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c))
    })
    return this
  }

  removeClass(cls: string): this {
    this.els.forEach((el) => {
      cls.split(/\s+/).filter(Boolean).forEach(c => el.classList.remove(c))
    })
    return this
  }

  hasClass(cls: string): boolean {
    return this.els.some(el => el.classList.contains(cls))
  }

  toggleClass(cls: string, force?: boolean): this {
    this.els.forEach(el => el.classList.toggle(cls, force))
    return this
  }

  attr(name: string, value?: string): this | string | undefined {
    if (value === undefined)
      return this.els[0]?.getAttribute(name) ?? undefined
    this.els.forEach(el => el.setAttribute(name, value))
    return this
  }

  removeAttr(name: string): this {
    this.els.forEach(el => el.removeAttribute(name))
    return this
  }

  prop(name: string, value?: any): this | any {
    if (value === undefined)
      return (this.els[0] as any)?.[name]
    this.els.forEach((el) => {
      (el as any)[name] = value
    })
    return this
  }

  css(prop: string | Record<string, any>, value?: any): this {
    if (typeof prop === 'string') {
      this.els.forEach((el) => {
        (el.style as any)[toCamel(prop)] = value == null ? '' : value
      })
    }
    else {
      Object.keys(prop).forEach((key) => {
        const v = prop[key]
        this.els.forEach((el) => {
          (el.style as any)[toCamel(key)] = v == null ? '' : v
        })
      })
    }
    return this
  }

  text(value?: string): this | string {
    if (value === undefined)
      return this.els[0]?.textContent ?? ''
    this.els.forEach(el => (el.textContent = value))
    return this
  }

  html(value?: string): this | string {
    if (value === undefined)
      return this.els[0]?.innerHTML ?? ''
    this.els.forEach(el => (el.innerHTML = value))
    return this
  }

  val(value?: any): this | string {
    if (value === undefined)
      return (this.els[0] as any)?.value ?? ''
    this.els.forEach((el) => {
      (el as any).value = value
    })
    return this
  }

  append(...nodes: Array<Dom | HTMLElement | string>): this {
    this.els.forEach((el) => {
      nodes.forEach((node) => {
        if (typeof node === 'string') {
          el.append(...parseHTML(node))
        }
        else if (node instanceof Dom) {
          node.els.forEach(n => el.appendChild(n))
        }
        else {
          el.appendChild(node)
        }
      })
    })
    return this
  }

  appendTo(target: Dom | HTMLElement | string): this {
    const host = target instanceof Dom ? target : dom(target)
    host.els.forEach(h => h.appendChild(this.els[0]))
    return this
  }

  prepend(...nodes: Array<Dom | HTMLElement | string>): this {
    this.els.forEach((el) => {
      const frag = document.createDocumentFragment()
      nodes.forEach((node) => {
        if (typeof node === 'string') {
          parseHTML(node).forEach(n => frag.appendChild(n))
        }
        else if (node instanceof Dom) {
          node.els.forEach(n => frag.appendChild(n))
        }
        else {
          frag.appendChild(node)
        }
      })
      el.insertBefore(frag, el.firstChild)
    })
    return this
  }

  before(...nodes: Array<Dom | HTMLElement | string>): this {
    this.els.forEach((el) => {
      const parent = el.parentElement
      if (!parent)
        return
      nodes.forEach((node) => {
        if (typeof node === 'string') {
          parseHTML(node).forEach(n => parent.insertBefore(n, el))
        }
        else if (node instanceof Dom) {
          node.els.forEach(n => parent.insertBefore(n, el))
        }
        else {
          parent.insertBefore(node, el)
        }
      })
    })
    return this
  }

  after(...nodes: Array<Dom | HTMLElement | string>): this {
    this.els.forEach((el) => {
      const parent = el.parentElement
      if (!parent)
        return
      let ref: Node = el
      nodes.forEach((node) => {
        const insert = (n: Node) => {
          parent.insertBefore(n, ref.nextSibling)
          ref = n
        }
        if (typeof node === 'string') {
          parseHTML(node).forEach(n => insert(n))
        }
        else if (node instanceof Dom) {
          node.els.forEach(n => insert(n))
        }
        else {
          insert(node)
        }
      })
    })
    return this
  }

  remove(): this {
    this.els.forEach(el => el.parentElement?.removeChild(el))
    return this
  }

  empty(): this {
    this.els.forEach(el => (el.innerHTML = ''))
    return this
  }

  clone(): Dom {
    return new Dom(this.els.map(el => el.cloneNode(true) as HTMLElement))
  }

  on(events: string, handler: EventHandler, options?: AddEventListenerOptions): this {
    events.split(/\s+/).filter(Boolean).forEach((evt) => {
      this.els.forEach((el) => {
        el.addEventListener(evt, e => handler.call(el, e), options)
        const store = (el as any).__hiprintHandlers__ || ((el as any).__hiprintHandlers__ = [])
        store.push({ evt, handler, options })
      })
    })
    return this
  }

  off(events: string, handler?: EventHandler): this {
    events.split(/\s+/).filter(Boolean).forEach((evt) => {
      this.els.forEach((el) => {
        const store: any[] = (el as any).__hiprintHandlers__ || []
        store
          .filter(h => h.evt === evt && (handler ? h.handler === handler : true))
          .forEach((h) => {
            el.removeEventListener(evt, h.handler as any, h.options)
          })
        ;(el as any).__hiprintHandlers__ = store.filter(
          h => !(h.evt === evt && (handler ? h.handler === handler : true)),
        )
      })
    })
    return this
  }

  trigger(event: string, detail?: any): this {
    this.els.forEach((el) => {
      const e = new CustomEvent(event, { bubbles: true, detail })
      el.dispatchEvent(e)
    })
    return this
  }

  offset(): { left: number, top: number } {
    const el = this.els[0]
    if (!el)
      return { left: 0, top: 0 }
    const rect = el.getBoundingClientRect()
    return { left: rect.left + window.scrollX, top: rect.top + window.scrollY }
  }

  position(): { left: number, top: number } {
    const el = this.els[0]
    if (!el)
      return { left: 0, top: 0 }
    return { left: el.offsetLeft, top: el.offsetTop }
  }

  width(value?: number | string): this | number {
    if (value === undefined)
      return this.els[0]?.clientWidth ?? 0
    this.els.forEach((el) => {
      (el as HTMLElement).style.width = typeof value === 'number' ? `${value}px` : value
    })
    return this
  }

  height(value?: number | string): this | number {
    if (value === undefined)
      return this.els[0]?.clientHeight ?? 0
    this.els.forEach((el) => {
      (el as HTMLElement).style.height = typeof value === 'number' ? `${value}px` : value
    })
    return this
  }

  outerWidth(): number {
    const el = this.els[0]
    if (!el)
      return 0
    const rect = (el as HTMLElement).getBoundingClientRect()
    return rect.width
  }

  outerHeight(): number {
    const el = this.els[0]
    if (!el)
      return 0
    const rect = (el as HTMLElement).getBoundingClientRect()
    return rect.height
  }

  show(): this {
    this.els.forEach(el => ((el as HTMLElement).style.display = ''))
    return this
  }

  hide(): this {
    this.els.forEach(el => ((el as HTMLElement).style.display = 'none'))
    return this
  }

  index(): number {
    const el = this.els[0]
    if (!el?.parentElement)
      return -1
    return Array.from(el.parentElement.children).indexOf(el)
  }
}

export function isDom(x: any): x is Dom {
  return !!x && x instanceof Dom
}

export function dom(selector: Selector | Dom): Dom {
  if (isDom(selector))
    return selector as Dom
  if (!selector)
    return new Dom([])
  if (selector instanceof HTMLElement)
    return new Dom([selector])
  if (selector === document || selector === window)
    return new Dom([])
  if (typeof selector === 'string') {
    if (selector.startsWith('<'))
      return new Dom(parseHTML(selector))
    return new Dom(
      Array.from(document.querySelectorAll<HTMLElement>(selector)),
    )
  }
  if (Array.isArray(selector) || selector instanceof NodeList) {
    return new Dom(
      Array.from(selector as ArrayLike<Node>).filter(
        (n): n is HTMLElement => n.nodeType === 1,
      ),
    )
  }
  return new Dom([])
}

export function h(
  tag: string,
  attrs?: Record<string, any>,
  ...children: Array<Dom | HTMLElement | string>
): Dom {
  const el = document.createElement(tag)
  if (attrs) {
    Object.keys(attrs).forEach((key) => {
      const v = attrs[key]
      if (key === 'class' || key === 'className')
        el.className = v
      else if (key === 'style' && typeof v === 'object')
        Object.assign(el.style, v)
      else if (key.startsWith('on') && typeof v === 'function')
        el.addEventListener(key.slice(2).toLowerCase(), v)
      else if (key === 'html')
        el.innerHTML = v
      else if (v !== undefined && v !== null && v !== false)
        el.setAttribute(key, v === true ? '' : String(v))
    })
  }
  const wrapper = new Dom([el])
  if (children.length)
    wrapper.append(...children)
  return wrapper
}

export { toCamel, toKebab }
