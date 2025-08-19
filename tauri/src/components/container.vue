<script setup lang="ts">
import Guides from '@scena/guides'

import { useResizeObserver } from '@vueuse/core'

import InfiniteViewer from 'infinite-viewer'
import { getElementInfo } from 'moveable'
import { computed, onMounted, provide, ref, shallowRef, useTemplateRef, watch } from 'vue'

import { createElement, useElements } from '@/store/elements'
import { usePicker } from '@/store/picker'
import { useViewport } from '@/store/viewport'
import VueMoveable from './moveable.vue'
import VueSelecto from './selecto.vue'
import Viewport from './viewport.vue'

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

const { width, height, currentSize } = useViewport()

const horizontalGuides = shallowRef<TGuides>()
const verticalGuides = shallowRef<TGuides>()

const viewer = shallowRef<InfiniteViewer>()

const horizonRange = ref<[[number, number]]>([[0, width.value]])
const verticalRange = ref<[[number, number]]>([[0, height.value]])

watch(currentSize, () => {
  const rect = getElementInfo(viewport.value!.$el)

  horizonRange.value = [[rect.left, rect.right]]
  verticalRange.value = [[rect.top, rect.bottom]]

  console.log('handleCHangesize')

  horizontalGuides.value?.forceUpdate()
  verticalGuides.value?.forceUpdate()
})

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
    selectedRangesText: true,
    selectedRanges: horizonRange.value,
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
    selectedRanges: verticalRange.value,
  })
  // .on('changeGuides', ({ guides }) => {
  //   moveable.verticalGuidelines = guides
  // })

  viewer.value = new InfiniteViewer(
    container.value!,
    viewport.value!.$el,
    {
      // usePinch: false,
      // pinchThreshold: 50,
      useMouseDrag: false,
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
  })

  // .on('pinch', (e) => {
  //   const zoom = Math.max(0.1, e.zoom)

  //   if (verticalGuides.value && horizontalGuides.value) {
  //     verticalGuides.value.zoom = zoom
  //     horizontalGuides.value.zoom = zoom
  //   }
  // })

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

const draggable = true
const throttleDrag = 1
const edgeDraggable = false
const startDragRotate = 0
const throttleDragRotate = 0
const targetRef = ref(null)

function onDrag(e: any) {
  e.target.style.transform = e.transform
}

function onResize(e: any) {
  e.target.style.width = `${e.width}px`
  e.target.style.height = `${e.height}px`
  e.target.style.transform = e.drag.transform
}

const renderDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

const throttleResize = 1

const selecto = useTemplateRef('selecto')

provide('selecto', selecto)

function handleDrag(e: any) {
  console.log(e)
}

const { addElement, elements } = useElements()
const { currentPicker } = usePicker()

provide('elements', elements)

function handleDragEnd(e: any) {
  console.log('Drag ended:', e.rect)

  const newElement = createElement(currentPicker.value, {
    x: e.rect.left,
    y: e.rect.top,
    w: e.rect.width,
    h: e.rect.height,
  })

  addElement(newElement)

  console.log('Element added:', elements.value)
}
</script>

<template>
  <div ref="wrap" class="relative w-full h-full">
    <div class="box" />
    <div ref="horizontal" class="ruler horizontal" />
    <div ref="vertical" class="ruler vertical" />

    <div ref="container" class="container relative bg-background-deep">
      <VueMoveable
        :target="targetRef"
        :draggable="draggable"
        :resizable="true"
        keep-ratio
        :throttle-drag="throttleDrag"
        :edge-draggable="edgeDraggable"
        :start-drag-rotate="startDragRotate"
        :throttle-drag-rotate="throttleDragRotate"
        :throttle-resize="throttleResize"

        :render-directions="renderDirections"
        @drag="onDrag"
        @resize="onResize"
      />

      <Viewport id="viewport" ref="viewport" class="viewport bg-white text-black" :style="{ width: `${width}px`, height: `${height}px` }">
        <div
          ref="targetRef"
          class="target"
        >
          232323
          232323
        </div>
      </Viewport>
    </div>

    <VueSelecto
      ref="selecto"
      :get-element-rect="getElementInfo"
      drag-container="#viewport"
      :hit-rate="0"
      :selectable-targets="[targetRef!]"
      select-by-click
      :select-from-inside="true"
      :toggle-continue-select="['shift']"
      prevent-default
      :scroll-options="{
        container: () => viewer?.getContainer()!,
        threshold: 30,
        throttleTime: 30,
        getScrollPosition: () => {
          console.log(viewer?.getScrollLeft({ absolute: true })!)
          console.log(viewer?.getScrollTop({ absolute: true })!)

          return [
            viewer?.getScrollLeft({ absolute: true })!,
            viewer?.getScrollTop({ absolute: true })!,
          ]
        },
      }"

      @scroll="({ direction }: { direction: number[] }) => {
        viewer?.scrollBy(direction[0] * 10, direction[1] * 10);
      }"

      @drag-end="handleDragEnd"
    />
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
  border: 1px solid #eee;
  box-sizing: border-box;
  text-align: center;
}

.target {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 150px;
  left: 100px;
  line-height: 100px;
  text-align: center;
  background: #ee8;
  color: #333;
  font-weight: bold;
  border: 1px solid #333;
  box-sizing: border-box;
}
</style>
