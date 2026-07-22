import type { Dom } from '../utils/dom'

/**
 * Convert image elements to base64 data URLs. Used for socket.io direct print and PDF export.
 */
export function imageToBase64(img: HTMLImageElement | Dom): Promise<string | null> {
  const el = (img as any).els?.[0] as HTMLImageElement | undefined
  const imageEl = el || (img as HTMLImageElement)
  if (!imageEl)
    return Promise.resolve(null)
  return new Promise((resolve) => {
    if (imageEl.src.startsWith('data:')) {
      resolve(imageEl.src)
      return
    }
    const canvas = document.createElement('canvas')
    const tempImg = new Image()
    tempImg.crossOrigin = 'anonymous'
    tempImg.onload = () => {
      canvas.width = tempImg.naturalWidth
      canvas.height = tempImg.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(tempImg, 0, 0)
      try {
        resolve(canvas.toDataURL('image/png'))
      }
      catch {
        resolve(null)
      }
    }
    tempImg.onerror = () => resolve(null)
    tempImg.src = imageEl.src
  })
}

export async function transformImg(imgs: HTMLImageElement[] | Dom): Promise<void> {
  const list = (imgs as any).els ? Array.from((imgs as any).els) : (imgs as HTMLImageElement[])
  for (const img of list) {
    const dataUrl = await imageToBase64(img as HTMLImageElement)
    if (dataUrl)
      (img as HTMLImageElement).src = dataUrl
  }
}
