<script setup lang="ts">
import Ruler from '@scena/ruler'
import { onMounted, useTemplateRef } from 'vue'

import { VueInfiniteViewer } from 'vue3-infinite-viewer'

// const container = useTemplateRef('container')

function handleInit() {
  const container = document.querySelector('#app')

  if (!container) {
    console.error('Container ref is not defined')
    return
  }

  const horizontalRuler = new Ruler(container, {
    type: 'horizontal',
  })

  const verticalRuler = new Ruler(container, {
    type: 'vertical',
  })

  window.addEventListener('resize', () => {
    horizontalRuler.resize()
    verticalRuler.resize()
  })
}

onMounted(() => {
  handleInit()
})
</script>

<template>
  <VueInfiniteViewer ref="container" class="vue-infinite-viewer" style="width: 100vw; height: 100vh;">
    <div>
      <slot />
    </div>
  </VueInfiniteViewer>
</template>
