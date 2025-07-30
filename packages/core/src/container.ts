import type { Element } from './element'

// export interface Container {
//   addElement: (element: Element) => void
//   removeElement: (element: Element) => void
//   getElements: () => Element[]

//   elements: Element[]
// }

export interface Container {
  index: number
  name: string
  width: string
  height: string
  elements: Element[]
}
