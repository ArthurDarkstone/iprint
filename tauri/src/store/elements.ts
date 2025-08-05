// store.ts
import { createGlobalState } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'

export type ElementType = 'text' | 'image' | 'rect' | 'circle' | 'barcode' | 'qrcode'

export enum IPrintFlags {
  IS_Element = '_is_element',
  IS_Group = '_is_group',
}

export interface Element {

  [IPrintFlags.IS_Element]: true

  id: string
  type: ElementType
  style: Record<string, any>
  width: number
  height: number
  x: number
  y: number
}

export interface Group {
  [IPrintFlags.IS_Group]: true
  type: 'group'
  id: string
  title: string
  children: Array<Group | Element>

  // scope: string[]
  // opacity: number
  // display: string
}

let id = 0

export function generateId() {
  return `ip-e-${id++}`
}

export function createElement(type: ElementType, props: Partial<Element>): Element {
  return {
    [IPrintFlags.IS_Element]: true,
    id: generateId(),
    type,
    style: {},
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    ...props,
  }
}

export function createGroup(group: Partial<Group> = {}): Group {
  return {
    [IPrintFlags.IS_Group]: true,
    type: 'group',
    id: generateId(),
    title: 'New Group',
    children: [],
    ...group,
  }
}

export function isElement(obj: any): obj is Element {
  return obj && obj[IPrintFlags.IS_Element] === true
}

export function isGroup(obj: any): obj is Group {
  return obj && obj[IPrintFlags.IS_Group] === true
}

export type Elements = Element[]

export const useElements = createGlobalState(
  () => {
    // state
    const _elements = shallowRef<Elements>([])

    // getters
    const elements = computed(() => _elements.value)

    // actions
    function setElements(newElements: Elements) {
      _elements.value = newElements
    }

    function addElement(newElement: Element) {
      if (!isElement(newElement)) {
        return
      }

      _elements.value.push(newElement)
    }

    function removeElement(element: Element) {
      if (!isElement(element)) {
        return
      }

      const index = elements.value.findIndex(el => el.id === element.id)
      if (index !== -1) {
        _elements.value.splice(index, 1)
      }
    }

    return { elements, setElements, addElement, removeElement }
  },
)
