<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useTemplate } from '@/store/template'

const { getOrCreate, printData } = useTemplate()

const paperSizes = ['A3', 'A4', 'A5', 'B3', 'B4', 'B5'] as const
const customWidth = ref(210)
const customHeight = ref(297)

function setPaper(size: string) {
  getOrCreate().setPaper(size)
}

function setCustomPaper() {
  getOrCreate().setPaper(customWidth.value, customHeight.value)
}

function rotatePaper() {
  getOrCreate().rotatePaper()
}

function clearTemplate() {
  getOrCreate().clear()
}

function browserPrint() {
  getOrCreate().print(printData.value)
}

async function exportPdf() {
  await getOrCreate().toPdf(printData.value, 'iprint-export')
}

function getJson() {
  return JSON.stringify(getOrCreate().getJson(), null, 2)
}

function getRenderedHtml() {
  const html = getOrCreate().getHtml(printData.value)
  return (html as any)?.els?.[0]?.outerHTML || ''
}

function showJson() {
  // eslint-disable-next-line no-alert
  alert(getJson())
}

function showHtml() {
  // eslint-disable-next-line no-alert
  alert(getRenderedHtml())
}

function handleGithub() {
  window.open('https://github.com/ArthurDarkstone/iprint', '_blank')
}

const isDark = useDark()
isDark.value = true

interface Printer {
  Name: string
}
const currentPrinter = ref<Printer | null>(null)
const printerList = ref<Printer[]>([])

onMounted(async () => {
  try {
    const { getPrinters } = await import('tauri-plugin-printer-v2')
    const printers = JSON.parse(await getPrinters())
    printerList.value = printers
  }
  catch {
    // printer plugin only available in tauri runtime
  }
})
</script>

<template>
  <div class="w-full h-12 bg-background border-b text-white flex items-center select-none justify-between">
    <div class="flex items-center ml-4 gap-1">
      <button v-for="size in paperSizes" :key="size" class="hiprint-toolbar-item px-2 py-1 border border-gray-500 rounded text-sm hover:bg-gray-700" @click="setPaper(size)">
        {{ size }}
      </button>
      <input v-model.number="customWidth" type="number" class="w-14 mx-1 px-1 text-black" placeholder="宽">
      <input v-model.number="customHeight" type="number" class="w-14 px-1 text-black" placeholder="高">
      <button class="hiprint-toolbar-item px-2 py-1 border border-gray-500 rounded text-sm hover:bg-gray-700" @click="setCustomPaper">
        自定义
      </button>
      <button class="hiprint-toolbar-item px-2 py-1 border border-gray-500 rounded text-sm hover:bg-gray-700" @click="rotatePaper">
        旋转
      </button>
      <button class="hiprint-toolbar-item px-2 py-1 border border-gray-500 rounded text-sm hover:bg-gray-700" @click="clearTemplate">
        清空
      </button>
    </div>

    <div class="w-20 text-center font-semibold">
      iPrint
    </div>

    <div class="mr-4 flex items-center gap-2">
      <select v-model="currentPrinter" class="w-40 px-1 py-1 rounded bg-gray-700 text-white text-sm">
        <option v-for="printer in printerList" :key="printer.Name" :value="printer">
          {{ printer.Name }}
        </option>
      </select>
      <button class="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-300 text-sm" @click="showJson">
        JSON
      </button>
      <button class="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-300 text-sm" @click="showHtml">
        HTML
      </button>
      <button class="px-2 py-1 bg-green-600 text-white rounded cursor-pointer hover:bg-green-400 text-sm" @click="exportPdf">
        PDF
      </button>
      <button class="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-300 text-sm" @click="browserPrint">
        打印
      </button>
      <span class="icon-[mdi--github] text-xxl cursor-pointer" @click="handleGithub" />
    </div>
  </div>
</template>
