<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
}>()
</script>

<template>
  <div class="bg-background w-full h-full">
    Right Panel Control<br>
    modelValue: {{ props.modelValue }}
  </div>
</template>
