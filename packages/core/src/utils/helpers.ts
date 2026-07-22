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

/**
 * Format a Date like hinnn.dateFormat: tokens M+ d+ H+ m+ s+ q+ S y+
 */
export function dateFormat(date: Date, format: string): string {
  const map: Array<[RegExp, () => string]> = [
    [/(y+)/, () => String(date.getFullYear())],
    [/(M+)/, () => String(date.getMonth() + 1)],
    [/(d+)/, () => String(date.getDate())],
    [/(H+)/, () => String(date.getHours())],
    [/(m+)/, () => String(date.getMinutes())],
    [/(s+)/, () => String(date.getSeconds())],
    [/(q+)/, () => String(Math.floor((date.getMonth() + 3) / 3))],
    [/S/, () => String(date.getMilliseconds())],
  ]
  let result = format
  map.forEach(([re, getter]) => {
    const m = re.exec(result)
    if (m) {
      const token = m[0]
      const val = getter()
      const pad = token.length > 1 && token !== 'S'
      result = result.replace(token, pad ? val.padStart(token.length, '0') : val)
    }
  })
  return result
}

/**
 * Format a value by a hiprint dataType/format pair (datetime / boolean).
 * Mirrors hiprint's getData: dateFormat for datetime, "trueText:falseText" split for boolean.
 */
export function formatDataType(value: any, dataType?: string, format?: string): any {
  if (!dataType || !format)
    return value
  if (dataType === 'datetime') {
    if (value == null || value === '')
      return value
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime()))
      return value
    return dateFormat(d, format)
  }
  if (dataType === 'boolean' || dataType === 'boolen') {
    const parts = format.split(':')
    if (parts.length > 0)
      return value === true || value === 'true' ? parts[0] : parts[1]
  }
  return value
}
