<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
}>()
</script>

<template>
  <div>
    Right Panel Control<br>
    modelValue: {{ props.modelValue }}
  </div>
</template>
