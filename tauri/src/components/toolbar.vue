<script setup lang="ts">
import { print } from '@iprint/core'
import { useDark } from '@vueuse/core'

import { getPrinters, printPdf } from 'tauri-plugin-printer-v2'

import { onMounted, ref } from 'vue'
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

async function handlePrint() {
  try {
    await Promise.resolve(print('#viewport', {
      style: `
        #viewport {
          transform: none !important;
          border: none !important;
        }
      `,
    }))
  }
  catch (err) {
    console.error('Print failed:', err)
    // Optionally surface a UI toast here.
  }
}

//  {
//   Name: 'LABEL MATRIX 2024 BSPRINT-1'
//   DriverName: 'Printer THT 8.0'
//   JobCount: 0
//   PrintProcessor: 'winprint'
//   PortName: 'BSPRINT-1'
//   ShareName: ''
//   ComputerName: ''
//   PrinterStatus: 0
//   Shared: false
//   Type: 0
//   Priority: 1
// }

interface Printer {
  Name: string
  DriverName: string
  JobCount: number
  PrintProcessor: string
  PortName: string
  ShareName: string
  ComputerName: string
  PrinterStatus: number
  Shared: boolean
  Type: number
  Priority: number
}
const currentPrinter = ref<Printer | null>(null)

const printerList = ref<Printer[]>([])

onMounted(async () => {
  const printers = JSON.parse(await getPrinters())
  printerList.value = printers
})

async function handleSystemPrint() {
  // const printers = JSON.parse(await getPrinters())
  // console.log('可用打印机:', printers)

  const result = await printPdf({
    path: 'C:/Users/mechrev/Downloads/test.pdf',
    printer: currentPrinter.value?.Name || printerList.value[0]?.Name,
    id: 'iprint-job-001',
    remove_after_print: false,
    print_settings: JSON.stringify({
      orientation: 'landscape',
      method: 'simplex', // duplex | simplex | duplexshort
      paper: 'A4', // "A2" | "A3" | "A4" | "A5" | "A6" | "letter" | "legal" | "tabloid"
      scale: 'noscale', // "noscale" | "shrink" | "fit"
      repeat: 1, // total copies,
      // range: "1,2,3"    // print page 1,2,3
      range: { // print page 1 - 3
        from: 1,
        to: 3,
      },
    }),
  })

  // eslint-disable-next-line no-console
  console.log('打印结果:', result)
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

    <div class="mr-4 flex items-center relative">
      <!-- theme -->
      <!-- <span class="icon-[mdi--theme-light-dark] text-xxl cursor-pointer" @click="() => toggleDark()" /> -->

      <!-- github -->

      <select v-model="currentPrinter" class=" w-40 mr-2 p-1 rounded bg-gray-700 text-white">
        <option v-for="printer in printerList" :key="printer.Name" :value="printer">
          {{ printer.Name }}
        </option>
      </select>

      <button
        class=" px-2 py-1 mr-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-300"
        @click="handleSystemPrint"
      >
        System Print
      </button>

      <button
        class=" px-2 py-1 mr-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-300"
        @click="handlePrint"
      >
        Browser Print
      </button>

      <span class="icon-[mdi--github] text-xxl cursor-pointer" @click="handleGithub" />
    </div>
  </div>
</template>
