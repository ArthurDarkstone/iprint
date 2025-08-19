<script setup lang="ts">
import type { Element } from '@/store/elements'

interface ElementProps {
  element: Element
}

const props = defineProps<ElementProps>()
</script>

<template>
  <div
    :key="props.element.id"
    class="bg-[#ccc] absolute"
    :style="`left: ${props.element.x}px; top: ${props.element.y}px; width: ${props.element.w}px; height: ${props.element.h}px;`"
  />
</template>
