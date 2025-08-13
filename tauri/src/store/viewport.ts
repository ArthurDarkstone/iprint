import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

export interface ViewportSize {
  width: number
  height: number
}

export const useViewport = createGlobalState(
  () => {
    const width = ref(400)
    const height = ref(400)

    // getters
    const currentSize = computed(() => ({ width: width.value, height: height.value }))
    // actions
    function setSize(newSize: ViewportSize) {
      width.value = newSize.width
      height.value = newSize.height
    }

    function setWidth(newWidth: number) {
      width.value = newWidth
    }

    function setHeight(newHeight: number) {
      height.value = newHeight
    }

    return { currentSize, setSize, setWidth, setHeight, width, height }
  },
)
