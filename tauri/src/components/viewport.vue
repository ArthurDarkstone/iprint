<script setup lang="ts">
import { watch, watchEffect } from 'vue'
import { useElements } from '@/store/elements'
import Element from './element.vue'

const { elements } = useElements()
</script>

<template>
  <div v-bind="$attrs" class="relative">
    <slot />

    <Element v-for="element of elements" :key="element.id" class="bg-green" :element="element">
      <div class="element-content">
        {{ JSON.stringify(element, null, 2) }}
      </div>
    </Element>
  </div>
</template>
