/**
 * Helper utilities for iprint
 */

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean, trailing?: boolean } = {},
): T {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  let result: any

  const later = function (this: any, ...args: any[]) {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(this, args)
  }

  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (!previous && options.leading === false)
      previous = now
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(this, args)
    }
    else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }

    return result
  } as T
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean,
): T {
  let timeout: NodeJS.Timeout | null = null
  let result: any

  const later = function (this: any, ...args: any[]) {
    timeout = null
    if (!immediate)
      result = func.apply(this, args)
  }

  return function (this: any, ...args: any[]) {
    const callNow = immediate && !timeout
    if (timeout)
      clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow)
      result = func.apply(this, args)
    return result
  } as T
}

export function toUtf8(str: string): string {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code >= 1 && code <= 127) {
      result += str.charAt(i)
    }
    else if (code > 2047) {
      result += String.fromCharCode(224 | (code >> 12) & 15)
      result += String.fromCharCode(128 | (code >> 6) & 63)
      result += String.fromCharCode(128 | (code >> 0) & 63)
    }
    else {
      result += String.fromCharCode(192 | (code >> 6) & 31)
      result += String.fromCharCode(128 | (code >> 0) & 63)
    }
  }
  return result
}

export function groupBy<T>(
  array: T[],
  groupFields: string[],
  groupFunction: (item: T) => any,
): Array<{ rows: T[] } & Record<string, any>> {
  const groups: Record<string, { rows: T[] } & Record<string, any>> = {}

  array.forEach((item) => {
    const key = JSON.stringify(groupFunction(item))
    if (!groups[key]) {
      groups[key] = { rows: [] }
      groupFields.forEach((field) => {
        groups[key][field] = (item as any)[field]
      })
    }
    groups[key].rows.push(item)
  })

  return Object.keys(groups).map(key => groups[key])
}

export function orderBy<T>(array: T[], compareFunction?: (a: T, b: T) => number): T[] {
  if (array.length <= 1)
    return array

  const mid = Math.floor(array.length / 2)
  const pivot = array.splice(mid, 1)[0]
  const left: T[] = []
  const right: T[] = []

  for (const item of array) {
    if (compareFunction) {
      if (compareFunction(item, pivot) <= 0) {
        left.push(item)
      }
      else {
        right.push(item)
      }
    }
    else {
      if (item <= pivot) {
        left.push(item)
      }
      else {
        right.push(item)
      }
    }
  }

  return [...orderBy(left, compareFunction), pivot, ...orderBy(right, compareFunction)]
}
