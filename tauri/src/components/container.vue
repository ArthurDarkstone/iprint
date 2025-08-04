<script setup lang="ts">
import Guides from '@scena/guides'

import { useResizeObserver } from '@vueuse/core'

import InfiniteViewer from 'infinite-viewer'

import { onMounted, shallowRef, useTemplateRef } from 'vue'

interface TGuides extends Guides {
  zoom?: number

  scroll: (pos: number, zoom?: number) => void
  scrollGuides: (pos: number, zoom?: number) => void
}

const horizontal = useTemplateRef('horizontal')
const vertical = useTemplateRef('vertical')
const container = useTemplateRef('container')
const viewport = useTemplateRef('viewport')

const wrap = useTemplateRef('wrap')

const horizontalGuides = shallowRef<TGuides>()
const verticalGuides = shallowRef<TGuides>()

const viewer = shallowRef<InfiniteViewer>()

function handleInit() {
  if (!container) {
    console.error('Container ref is not defined')
    return
  }

  horizontalGuides.value = new Guides(horizontal.value!, {
    snapThreshold: 5,
    snaps: [0, 300, 600],
    displayDragPos: true,
    dragPosFormat: v => `${v}px`,
  })
  // .on('changeGuides', ({ guides }) => {
  //   moveable.horizontalGuidelines = guides
  // })

  verticalGuides.value = new Guides(vertical.value!, {
    type: 'vertical',
    snapThreshold: 5,
    snaps: [0, 200, 400],
    displayDragPos: true,
    dragPosFormat: v => `${v}px`,
  })
  // .on('changeGuides', ({ guides }) => {
  //   moveable.verticalGuidelines = guides
  // })

  viewer.value = new InfiniteViewer(
    container.value!,
    viewport.value!,
    {
      // usePinch: true,
      // pinchThreshold: 50,
      useMouseDrag: true,
      useWheelScroll: true,
      useAutoZoom: true,
      zoomRange: [0.1, 10],
      maxPinchWheel: 10,
    },
  ).on('dragStart', (e) => {
    const target = e.inputEvent.target

    if (target.nodeName === 'A') {
      e.stop()
    }
  }).on('scroll', (e) => {
    const zoom = viewer.value?.zoom
    horizontalGuides.value?.scroll(e.scrollLeft, zoom)
    horizontalGuides.value?.scrollGuides(e.scrollTop, zoom)

    verticalGuides.value?.scroll(e.scrollTop, zoom)
    verticalGuides.value?.scrollGuides(e.scrollLeft, zoom)
  }).on('pinch', (e) => {
    const zoom = Math.max(0.1, e.zoom)

    if (verticalGuides.value && horizontalGuides.value) {
      verticalGuides.value.zoom = zoom
      horizontalGuides.value.zoom = zoom
    }
  })

  requestAnimationFrame(() => {
    viewer.value?.scrollCenter()
  })
}

useResizeObserver(wrap, () => {
  horizontalGuides.value?.resize()
  verticalGuides.value?.resize()
})

onMounted(() => {
  handleInit()
})
</script>

<template>
  <div ref="wrap" class="relative w-full h-full">
    <div class="box" />
    <div ref="horizontal" class="ruler horizontal" />
    <div ref="vertical" class="ruler vertical" />

    <div ref="container" class="container">
      <div ref="viewport" class="viewport">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ruler {
  position: absolute;
  top: 0;
  left: 0;
}

.horizontal {
  left: 30px;
  width: calc(100% - 30px);
  height: 30px;
}
.vertical {
  top: 30px;
  width: 30px;
  height: calc(100% - 30px);
}

.box {
  position: relative;
  width: 30px;
  height: 30px;
  background: #444;
  box-sizing: border-box;
  z-index: 21;
}
.box:before,
.box:after {
  position: absolute;
  content: '';
  background: #777;
}
.box:before {
  width: 1px;
  height: 100%;
  left: 100%;
}
.box:after {
  height: 1px;
  width: 100%;
  top: 100%;
}

.container {
  position: absolute !important;
  left: 30px;
  top: 30px;
  width: calc(100% - 30px);
  height: calc(100% - 30px);
}

.viewport {
  width: 400px;
  /* height: 600px; */
  border: 1px solid #eee;
  box-sizing: border-box;
  text-align: center;
}
</style>
