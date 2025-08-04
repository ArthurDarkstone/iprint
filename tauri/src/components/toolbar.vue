<script setup lang="ts">
import { useStatus } from '@/store/status'

const { currentStatus, setStatus } = useStatus()

// select tools
const tools = [
  {
    name: 'pointer',
    icon: 'icon-[bx--pointer]',
    action: () => {
      setStatus('pointer')
    },
  },
  {
    name: 'rect',
    icon: 'icon-[subway--rectangular]',
    action: () => {
      setStatus('rect')
    },
  },
]

function handleGithub() {
  window.open('https://github.com/ArthurDarkstone/iprint', '_blank')
}
</script>

<template>
  <div class="w-full h-12 bg-gray-800  text-white  flex items-center  select-none justify-between ">
    <div class="flex items-center ml-4">
      <div v-for="tool in tools" :key="tool.name" class="cursor-pointer mr-4" @click="tool.action">
        <span :class="`${tool.icon} ${currentStatus === tool.name ? 'text-blue-500' : 'text-white'}`" />
      </div>
    </div>

    <div class=" w-20 text-center ">
      iPrint
    </div>

    <div class="mr-4">
      <!-- github -->
      <span class="icon-[mdi--github] text-xxl cursor-pointer" @click="handleGithub" />
    </div>
  </div>
</template>
