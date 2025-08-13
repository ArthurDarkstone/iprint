<script setup lang="ts">
import type { Picker } from '@/store/picker'
import { usePicker } from '@/store/picker'

// Example usage to avoid unused prop warning

const { currentPicker, setPicker } = usePicker()

const items: Array<{ key: Picker, title: string, icon: string }> = [
  {
    key: 'text',
    title: 'Text',
    icon: 'icon-[solar--text-bold]',
  },
  {
    key: 'image',
    title: 'Image',
    icon: 'icon-[lets-icons--img-box]',
  },
  {
    key: 'rect',
    title: 'Rect',
    icon: 'icon-[material-symbols--rectangle-outline]',
  },
  {
    key: 'circle',
    title: 'Circle',
    icon: 'icon-[carbon--circle-dash]',
  },
  {
    key: 'barcode',
    title: 'Barcode',
    icon: 'icon-[ic--baseline-qrcode]',
  },

  {
    key: 'qrcode',
    title: 'QR Code',
    icon: 'icon-[ic--baseline-qrcode]',
  },
] as const
</script>

<template>
  <div class="bg-background border-r w-full h-full">
    <div>
      <div class="text-lg font-semibold text-gray-700 pt-4 px-6">
        Basic Picker
      </div>
    </div>

    <div class="flex flex-wrap  justify-start px-4 ">
      <div
        v-for="item in items"
        :key="item.key"
        class=" w-32 h-32 flex flex-col  justify-center items-center m-2 p-2 border border-gray-300 rounded cursor-pointer hover:bg-accent"
        :class="{
          'bg-primary': currentPicker === item.key,
        }"
        @click="setPicker(item.key)"
      >
        <div class=" text-2xl">
          {{ item.title }}
        </div>
        <span class=" text-3xl w-10 h-10" :class="item.icon" />
      </div>
    </div>
  </div>
</template>
