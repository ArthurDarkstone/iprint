import type { ElementType } from './elements'
// store.ts
import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

export type Picker = ElementType

export const usePicker = createGlobalState(
  () => {
    // state
    const picker = ref<Picker>('text')

    // getters
    const currentPicker = computed(() => picker.value)

    // actions
    function setPicker(newPicker: Picker) {
      picker.value = newPicker
    }

    return { currentPicker, setPicker }
  },
)
