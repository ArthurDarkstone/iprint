<script setup lang="ts">
import { useElements } from '@/store/elements'
import Element from './element.vue'

const { elements } = useElements()
</script>

<template>
  <div v-bind="$attrs">
    <slot />

    <div data-element-id="viewport">
      <Element v-for="element in elements" :key="element.id" :element="element" />
    </div>
  </div>
</template>
