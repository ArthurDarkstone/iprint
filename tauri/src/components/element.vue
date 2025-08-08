<script setup lang="ts">
import type { Element } from '@/store/elements'

interface ElementProps {
  element: Element
}

const props = defineProps<ElementProps>()
</script>

<template>
  <div :key="props.element.id" :style="props.element.style" />
</template>
