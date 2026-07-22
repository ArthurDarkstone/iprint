<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { useTemplate } from '@/store/template'

const { getOrCreate } = useTemplate()

const designHost = useTemplateRef('designHost')
const previewOpen = ref(false)
const previewHtml = ref('')

function mount() {
  const host = designHost.value
  if (!host)
    return
  const tpl = getOrCreate()
  tpl.design(host, { axisEnabled: true })
}

function preview() {
  const tpl = useTemplate().getOrCreate()
  const { printData } = useTemplate()
  const html = tpl.getHtml(printData.value)
  previewHtml.value = (html as any)?.els?.[0]?.outerHTML || ''
  previewOpen.value = true
}

onMounted(mount)
</script>

<template>
  <div class="relative w-full h-full overflow-auto bg-gray-100">
    <div ref="designHost" class="hiprint-printTemplate w-fit mx-auto my-6" />

    <div v-if="previewOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" @click.self="previewOpen = false">
      <div class="bg-white p-4 rounded shadow-lg max-h-[90vh] overflow-auto">
        <div class="flex justify-between mb-2">
          <span class="font-semibold">预览</span>
          <button class="text-sm text-blue-500" @click="previewOpen = false">
            关闭
          </button>
        </div>
        <div class="prevViewDiv" v-html="previewHtml" />
      </div>
    </div>

    <button
      class="fixed bottom-4 right-4 px-3 py-2 bg-blue-500 text-white rounded shadow"
      @click="preview"
    >
      快速预览
    </button>
  </div>
</template>

<style scoped>
:deep(.hiprint-printPaper) {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
}
</style>
