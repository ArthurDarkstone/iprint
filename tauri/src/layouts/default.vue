<script setup lang="ts">
import container from '@/components/container.vue'
import Control from '@/components/control.vue'
import Picker from '@/components/picker.vue'
import Toolbar from '@/components/toolbar.vue'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
</script>

<template>
  <div class="relative w-full h-full">
    <Toolbar />

    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel :default-size="20">
        <Picker />
      </ResizablePanel>

      <ResizableHandle with-handle />

      <ResizablePanel>
        <container>
          <div>232323</div>

          <div>232323</div>
        </container>
      </ResizablePanel>

      <ResizableHandle with-handle />

      <ResizablePanel :default-size="20">
        <Control />
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<style scoped>

</style>
