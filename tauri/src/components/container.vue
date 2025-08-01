<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { ref } from 'vue'

const scaleFactor = 1

// 生成刻度
function drawRuler() {
  const svg = document.querySelector('svg')

  if (!svg)
    return

  svg.innerHTML = '' // 清空现有刻度

  const totalCm = 10 // 总长度：10cm
  const mmPerCm = 10 // 1cm=10mm

  // 绘制主刻度（1cm）和标签
  for (let cm = 0; cm <= totalCm; cm++) {
    // 主刻度线（长10mm）
    const mainTick = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    mainTick.setAttribute('x1', (cm * scaleFactor).toString())
    mainTick.setAttribute('y1', '0.5') // 起始y坐标
    mainTick.setAttribute('x2', (cm * scaleFactor).toString())
    mainTick.setAttribute('y2', '1.5') // 结束y坐标（长1cm）
    mainTick.setAttribute('stroke', '#333')
    mainTick.setAttribute('stroke-width', '0.02') // 线宽（0.02cm）
    svg.appendChild(mainTick)

    // 刻度标签（厘米数）
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', (cm * scaleFactor).toString())
    label.setAttribute('y', '1.8') // 标签y坐标
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('font-size', '0.3') // 字体大小（0.3cm）
    label.textContent = cm
    svg.appendChild(label)

    // 绘制副刻度（1mm）
    for (let mm = 1; mm < mmPerCm; mm++) {
      const isHalfCm = mm === 5 // 0.5cm处刻度稍长
      const x = (cm + mm / mmPerCm) * scaleFactor

      const subTick = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      subTick.setAttribute('x1', x.toString())
      subTick.setAttribute('y1', isHalfCm ? '0.7' : '0.9')
      subTick.setAttribute('x2', x.toString())
      subTick.setAttribute('y2', isHalfCm ? '1.3' : '1.1')
      subTick.setAttribute('stroke', isHalfCm ? '#666' : '#999')
      subTick.setAttribute('stroke-width', '0.015')
      svg.appendChild(subTick)
    }
  }
}

const container = ref<HTMLElement | null>(null)

useResizeObserver(container, () => {
  drawRuler()
})
</script>

<template>
  <div ref="container">
    <svg class="ruler-container" viewBox="0 0 10 2" preserveAspectRatio="xMidYMid meet">
    <!-- 刻度将在这里通过JS动态生成 -->
    </svg>

    <slot />
  </div>
</template>
