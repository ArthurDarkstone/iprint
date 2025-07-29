export function isObject(value) {
  return typeof value === 'object' && value !== null
}

/**
 * 看一下值有没有变
 * @param newValue
 * @param oldValue
 */
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function isOn(key) {
  return /^on[A-Z]/.test(key)
}
