<script setup lang="ts">
import { print } from '@iprint/core'
import { useDark } from '@vueuse/core'

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

function handlePrint() {
  print('#viewport')
}
const isDark = useDark()

isDark.value = true

// const toggleDark (isDark)
</script>

<template>
  <div class="w-full h-12 bg-background border-b text-white  flex items-center  select-none justify-between ">
    <div class="flex items-center ml-4">
      <div v-for="tool in tools" :key="tool.name" class="cursor-pointer mr-4" @click="tool.action">
        <span :class="`${tool.icon} ${currentStatus === tool.name ? 'text-blue-500' : 'text-white'}`" />
      </div>
    </div>

    <div class=" w-20 text-center ">
      iPrint
    </div>

    <div class="mr-4">
      <!-- theme -->
      <!-- <span class="icon-[mdi--theme-light-dark] text-xxl cursor-pointer" @click="() => toggleDark()" /> -->

      <!-- github -->

      <button
        class="absolute top-2 right-2 z-10 px-2 py-1 bg-blue-500 text-white rounded"
        @click="handlePrint"
      >
        Print
      </button>

      <span class="icon-[mdi--github] text-xxl cursor-pointer" @click="handleGithub" />
    </div>
  </div>
</template>
