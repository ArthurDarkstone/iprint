<script setup lang="ts">
import { useStatus } from '@/store/status'

const { currentStatus, setStatus } = useStatus()

// select tools
const tools = [
  {
    name: 'Pointer',
    icon: 'icon-[bx--pointer]',
    action: () => {
      setStatus('pointer')
    },
  },
  {
    name: 'Rect',
    icon: 'icon-[subway--rectangular]',
    action: () => {
      setStatus('rect')
    },
  },
]
</script>

<template>
  <div class="   w-full h-12 bg-gray-800  text-white  flex items-center  select-none justify-between px-4">
    <div class="flex items-center">
      <div v-for="tool in tools" :key="tool.name" class="cursor-pointer mr-4" @click="tool.action">
        <span :class="tool.icon" />
      </div>
    </div>

    <div class="flex-1 text-center ">
      iPrint Editor
    </div>

    <div>
      <!-- right -->
    </div>
  </div>
</template>
