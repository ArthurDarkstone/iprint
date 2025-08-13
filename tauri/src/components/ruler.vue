<script lang="ts">
import type {
  GuideOptions,
  GuidesInterface,
  GuidesOptions,
} from '@scena/guides'
import type { MethodInterface } from 'framework-utils'
import type { VueGuidesInterface } from './types'
import { isUndefined } from '@daybrush/utils'

import VanillaGuides, {
  EVENTS,
  METHODS,
  PROPERTIES,
} from '@scena/guides'

export interface VueGuidesInterface
  extends MethodInterface<GuidesInterface, VanillaGuides, VueGuidesInterface> {
  name: string
  $el: HTMLElement
  $props: GuideOptions & { vueStyle: Record<string, any> }
  $refs: any
  $emit: (name: string, e: any) => void
  $_guides: VanillaGuides
}

const VUE_PROPERTIES = [...PROPERTIES]

VUE_PROPERTIES.splice(VUE_PROPERTIES.indexOf('style'), 1)
const methods: Record<string, any> = {}
const watch: Record<string, any> = {}

VUE_PROPERTIES.forEach((name) => {
  watch[name] = function (this: VueGuidesInterface, value: any) {
    (this.$_guides as any)[name] = value
  }
})

watch.vueStyle = function (this: VueGuidesInterface, value: any) {
  (this.$_guides as any).style = value
}

METHODS.forEach((name) => {
  methods[name] = function (this: VueGuidesInterface, ...args: any[]) {
    return (this.$_guides as any)[name](...args)
  }
})

export default {
  name: 'Guides',
  props: [...VUE_PROPERTIES, 'vueStyle'],
  watch,
  mounted(this: VueGuidesInterface) {
    const options: Partial<GuidesOptions> = {}
    const props = this.$props
    VUE_PROPERTIES.forEach((name) => {
      const value = props[name]

      if (!isUndefined(value)) {
        (options as any)[name] = props[name]
      }
    })
    const refs = this.$refs
    const container = refs.container as HTMLElement

    options.style = props.vueStyle
    options.warpSelf = true

    this.$_guides = new VanillaGuides(container, options)

    const guides = this.$_guides

    EVENTS.forEach((name) => {
      (guides as any).on(name, (e: any) => {
        this.$emit(name, { ...e })
      })
    })
  },
  beforeUnmount(this: VueGuidesInterface) {
    this.$_guides.destroy()
  },
  methods,
}
</script>

<template>
  <div ref="container" />
</template>
