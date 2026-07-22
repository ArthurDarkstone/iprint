import type { PrintTemplate } from '../template/PrintTemplate'
import type { GetHtmlOptions, PrintData } from '../types'
import { event } from '../utils/event'

/**
 * Socket.io direct-print transport. Mirrors hiprint's hiwebSocket / print2 / printByHtml2.
 * Phase 6 will implement the full socket.io connection; this stub fails gracefully
 * when no client is connected (matching hiprint's `连接客户端失败` behavior).
 */

class HiwebSocket {
  opened = false
  private socket: any
  private printerList: any[] = []

  hasIo(): boolean {
    return typeof (globalThis as any).io !== 'undefined'
  }

  async start(url = 'http://localhost:17521'): Promise<void> {
    if (!this.hasIo()) {
      console.warn('socket.io is not available')
      return
    }
    const io = (await import('socket.io-client')).default as any
    this.socket = io(url, { reconnectionAttempts: 5 })
    this.socket.on('connect', () => {
      this.opened = true
    })
    this.socket.on('disconnect', () => {
      this.opened = false
    })
    this.socket.on('printerList', (list: any[]) => {
      this.printerList = list
    })
    this.socket.on('successs', (payload: any) => {
      event.trigger(`printSuccess_${payload.templateId}`)
    })
    this.socket.on('error', (payload: any) => {
      event.trigger(`printError_${payload.templateId}`)
    })
  }

  send(payload: any): void {
    this.socket?.emit('news', payload)
  }

  getPrinterList(): any[] {
    return this.printerList
  }
}

export const hiwebSocket: HiwebSocket = new HiwebSocket()

export async function print2(template: PrintTemplate, data?: PrintData, options?: GetHtmlOptions): Promise<void> {
  if (!hiwebSocket.opened) {
    // eslint-disable-next-line no-alert
    alert('连接客户端失败')
    return
  }
  const css = await collectStyles()
  const html = template.getHtml(data, { ...options, imgToBase64: true })
  hiwebSocket.send({
    id: Date.now(),
    html: css + (html as any).els?.[0]?.outerHTML,
    templateId: template.id,
  })
}

export async function printByHtml2(template: PrintTemplate, html: any, _options?: GetHtmlOptions): Promise<void> {
  if (!hiwebSocket.opened) {
    // eslint-disable-next-line no-alert
    alert('连接客户端失败')
    return
  }
  const css = await collectStyles()
  hiwebSocket.send({
    id: Date.now(),
    html: css + (html as any).els?.[0]?.outerHTML,
    templateId: template.id,
  })
}

async function collectStyles(): Promise<string> {
  if (typeof document === 'undefined')
    return ''
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  const texts: string[] = []
  for (const link of links) {
    try {
      const res = await fetch((link as HTMLLinkElement).href)
      texts.push(await res.text())
    }
    catch {
      // ignore fetch failures
    }
  }
  return texts.map(css => `<style>${css}</style>`).join('\n')
}
