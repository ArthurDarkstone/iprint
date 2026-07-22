<script setup lang="ts">
import { printElementTypeManager } from '@iprint/core'
import { onMounted, useTemplateRef } from 'vue'

const host = useTemplateRef('pickerHost')

const groups = printElementTypeManager.getElementTypeGroups('default')

onMounted(() => {
  if (host.value)
    printElementTypeManager.buildByHtml(host.value.querySelectorAll('.ep-draggable-item'))
})
</script>

<template>
  <div class="bg-background border-r w-full h-full overflow-y-auto">
    <div ref="pickerHost" class="rect-printElement-types hiprintEpContainer p-2">
      <div v-for="group in groups" :key="group.name" class="mb-4">
        <div class="text-lg font-semibold text-gray-700 pt-2 px-2">
          {{ group.name }}
        </div>
        <ul class="hiprint-printElement-type">
          <li>
            <ul class="flex flex-wrap">
              <li v-for="t in group.printElementTypes" :key="t.tid">
                <a class="ep-draggable-item" :tid="t.tid">
                  {{ t.title || t.text }}
                  <span class="glyphicon-class" />
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ep-draggable-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 90px;
  margin: 4px;
  padding: 6px;
  color: #b9a5a6;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.15);
  cursor: grab;
  user-select: none;
}
</style>
