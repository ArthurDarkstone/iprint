<script setup lang="ts">
import { onMounted } from 'vue'
import { useTemplate } from '@/store/template'

const { getOrCreate } = useTemplate()

onMounted(() => {
  // Ensure the template exists with this container as the option-setting host.
  getOrCreate()
})
</script>

<template>
  <div class="bg-background w-full h-full overflow-y-auto">
    <div class="px-2 py-3 text-sm text-gray-500 border-b">
      属性面板
    </div>
    <div id="PrintElementOptionSetting" class="p-1" />
  </div>
</template>
