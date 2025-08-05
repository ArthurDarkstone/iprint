// store.ts
import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

export type Status = 'pointer' | 'rect'

export const useStatus = createGlobalState(
  () => {
    // state
    const status = ref<Status>('pointer')

    // getters
    const currentStatus = computed(() => status.value)

    // actions
    function setStatus(newStatus: Status) {
      status.value = newStatus
    }

    return { currentStatus, setStatus }
  },
)
