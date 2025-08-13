/**
 * this code is generate by ai reference to https://doersguild.github.io/jQuery.print/
 *
 * dropped jQuery dependency and use native DOM API
 * type definitions for better TypeScript support
 */

function cloneWithFormValues(elmToClone: HTMLElement) {
  const result = elmToClone.cloneNode(true) as HTMLElement
  // 克隆 textarea
  const textareaList = elmToClone.querySelectorAll('textarea')
  const resultTextareaList = (result).querySelectorAll('textarea')
  textareaList.forEach((ta, i) => {
    resultTextareaList[i].value = ta.value
  })
  // 克隆 select
  const selects = elmToClone.querySelectorAll('select')
  const resultSelects = result.querySelectorAll('select')
  selects.forEach((sel, i) => {
    Array.from(sel.options).forEach((opt, j) => {
      resultSelects[i].options[j].selected = opt.selected
    })
  })
  // 克隆 canvas
  const canvases = elmToClone.querySelectorAll('canvas')
  const resultCanvases = result.querySelectorAll('canvas')
  canvases.forEach((canvas, i) => {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const resultCtx = resultCanvases[i].getContext('2d')
      if (resultCtx) {
        resultCtx.drawImage(canvas, 0, 0)
      }
      resultCanvases[i].setAttribute('data-print', canvas.toDataURL())
    }
  })
  return result
}

function getDomFromString(str: string) {
  const container = document.createElement('span')
  // container.innerHTML = str || ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(str || '', 'text/html')
  container.append(...doc.body.childNodes)

  return container
}

function printFrame(frameWindow: HTMLIFrameElement | Window | Document, content: string, options: any) {
  return new Promise<void>((resolve, reject) => {
    try {
      frameWindow = (frameWindow as HTMLIFrameElement).contentWindow || (frameWindow as HTMLIFrameElement).contentDocument || frameWindow
      try {
        if (frameWindow instanceof Window) {
          frameWindow.resizeTo(window.innerWidth, window.innerHeight)
        }
      }
      catch (err) {
        console.warn(err)
      }
      const document = (frameWindow as Window).document || (frameWindow as HTMLIFrameElement).contentDocument || frameWindow
      if (options.doctype) {
        document.write(options.doctype)
      }
      document.write(content)
      try {
        const canvas = document.querySelectorAll('canvas')
        for (let i = 0; i < canvas.length; i++) {
          const ctx = canvas[i].getContext('2d')
          const image = new Image()
          image.onload = function () {
            // ctx!.drawImage(image, 0, 0)

            if (ctx) {
              ctx.drawImage(image, 0, 0)
            }
          }
          // image.src = canvas[i].getAttribute('data-print')!
          const dataUrl = canvas[i].getAttribute('data-print')
          if (dataUrl) {
            image.src = dataUrl
          }
        }
      }
      catch (err) {
        console.warn(err)
      }
      document.close()
      let printed = false
      function callPrint() {
        if (printed)
          return
        (frameWindow as Window).focus()
        try {
          if (!(frameWindow as Window).document.execCommand('print', false)) {
            (frameWindow as Window).print()
          }
        }
        catch (e) {
          (frameWindow as Window).print()

          console.warn(e)
        }
        (frameWindow as Window).close()
        printed = true
        resolve()
      }
      frameWindow.addEventListener('load', callPrint)
      setTimeout(callPrint, options.timeout)
    }
    catch (err) {
      reject(err)
    }
  })
}

function printContentInIFrame(content: string, options: PrintOptions) {
  let iframe = document.querySelector(options.iframe as string) as HTMLIFrameElement
  let iframeCreated = false
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.style.height = '0'
    iframe.style.width = '0'
    iframe.style.border = '0'
    iframe.style.position = 'absolute'
    iframe.style.top = '-999px'
    iframe.style.left = '-999px'
    document.body.prepend(iframe)
    iframeCreated = true
  }

  return printFrame(iframe, content, options)
    .then(() => {
      setTimeout(() => {
        if (iframeCreated) {
          iframe.remove()
        }
      }, 1000)
    })
    .catch((err) => {
      console.error('Failed to print from iframe', err)
      printContentInNewWindow(content, options)
    })
    .finally(() => {
      try {
        options.deferred && options.deferred.resolve && options.deferred.resolve()
      }
      catch (err) {
        console.warn('Error notifying deferred', err)
      }
    })
}

function printContentInNewWindow(content: string, options: PrintOptions) {
  const frameWindow = window.open()
  if (!frameWindow) {
    console.error('Failed to open print window. Please check popup blocker settings.')
    return Promise.reject(new Error('Failed to open print window'))
  }
  return printFrame(frameWindow, content, options)
}

function isNode(o: any): o is Node {
  return !!(typeof Node === 'object' ? o instanceof Node : o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string')
}

export interface PrintOptions {
  globalStyles?: boolean
  mediaPrint?: boolean
  stylesheet?: string | string[]
  noPrintSelector?: string
  iframe?: boolean | string | HTMLIFrameElement
  append?: string | HTMLElement
  prepend?: string | HTMLElement
  manuallyCopyFormValues?: boolean
  deferred?: any
  timeout?: number
  title?: string
  doctype?: string
  style: string
}

export function print(elementOrSelector: string | HTMLElement | Node, userOptions: Partial<PrintOptions> = {}): any {
  let element
  if (typeof elementOrSelector === 'string') {
    element = document.querySelector(elementOrSelector)
  }
  else if (isNode(elementOrSelector)) {
    element = elementOrSelector
  }
  else {
    element = document.documentElement
  }
  if (!element) {
    element = document.documentElement
  }
  const defaults = {
    globalStyles: true,
    mediaPrint: false,
    stylesheet: null,
    noPrintSelector: '.no-print',
    iframe: true,
    append: null,
    prepend: null,
    manuallyCopyFormValues: true,
    deferred: null,
    timeout: 750,
    title: null,
    doctype: '<!doctype html>',
    style: '',
  }
  const options = Object.assign({}, defaults, userOptions) as PrintOptions
  // 处理样式
  let styles = [] as HTMLStyleElement[]
  if (options.globalStyles) {
    styles = Array.from(document.querySelectorAll('style, link, meta, base, title'))
  }
  else if (options.mediaPrint) {
    styles = Array.from(document.querySelectorAll('link[media=print]'))
  }
  if (options.stylesheet) {
    const sheets = Array.isArray(options.stylesheet) ? options.stylesheet : [options.stylesheet]
    sheets.forEach((href) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      styles.push(link)
    })
  }

  if (options.style) {
    const style = document.createElement('style')
    style.textContent = options.style
    styles.push(style)
  }

  // 克隆要打印的内容
  const copy = cloneWithFormValues(element as HTMLElement)
  // 包裹一层 span
  const wrapper = document.createElement('span')
  wrapper.appendChild(copy)
  // 移除不打印的元素
  wrapper.querySelectorAll(options.noPrintSelector as string).forEach(el => el.remove())
  // 添加样式
  styles.forEach((styleEl) => {
    wrapper.appendChild(styleEl.cloneNode(true))
  })
  // 设置 title
  if (options.title) {
    let title = wrapper.querySelector('title')
    if (!title) {
      title = document.createElement('title')
      wrapper.appendChild(title)
    }
    title.textContent = options.title
  }
  // 追加内容
  if (options.append) {
    if (typeof options.append === 'string') {
      wrapper.appendChild(getDomFromString(options.append) as HTMLElement)
    }
    else {
      wrapper.appendChild(options.append.cloneNode(true) as HTMLElement)
    }
  }
  // 前置内容
  if (options.prepend) {
    if (typeof options.prepend === 'string') {
      wrapper.insertBefore(getDomFromString(options.prepend) as HTMLElement, wrapper.firstChild)
    }
    else {
      wrapper.insertBefore(options.prepend.cloneNode(true) as HTMLElement, wrapper.firstChild)
    }
  }

  // 手动复制表单值
  if (options.manuallyCopyFormValues) {
    wrapper.querySelectorAll('input').forEach((field) => {
      if (field.type === 'radio' || field.type === 'checkbox') {
        if (field.checked) {
          field.setAttribute('checked', 'checked')
        }
      }
      else {
        field.setAttribute('value', field.value)
      }
    })
    wrapper.querySelectorAll('select').forEach((field) => {
      Array.from(field.options).forEach((opt) => {
        if (opt.selected) {
          opt.setAttribute('selected', 'selected')
        }
      })
    })
    wrapper.querySelectorAll('textarea').forEach((field) => {
      field.textContent = field.value
    })
  }
  // 获取 HTML 字符串
  const content = wrapper.innerHTML
  // 打印
  if (options.iframe) {
    printContentInIFrame(content, options as PrintOptions)
  }
  else {
    printContentInNewWindow(content, options as PrintOptions)
  }
  return element
}
