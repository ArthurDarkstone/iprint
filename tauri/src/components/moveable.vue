<script lang="ts">
import type {
  MoveableEvents,
  MoveableInterface,
  MoveableOptions,
  MoveableProperties,
} from 'moveable'
import { isUndefined } from '@daybrush/utils'
import VanillaMoveable, {
  EVENTS,
  METHODS,
  PROPERTIES,
} from 'moveable'
import { defineComponent } from 'vue'

interface ComponentInstance {
  $_moveable: VanillaMoveable
}

const methods: Record<string, any> = {}

METHODS.forEach((name) => {
  methods[name] = function (this: ComponentInstance, ...args: any[]) {
    return this.$_moveable[name](...args)
  }
})
const watch: Record<string, any> = {}

PROPERTIES.forEach((name) => {
  watch[name] = function (this: ComponentInstance, value: any) {
    this.$_moveable[name] = value
  }
})

const VueMoveable = defineComponent<
    Partial<MoveableProperties>,
    {},
    {},
    {},
    { [key in keyof MoveableInterface]: MoveableInterface[key] },
    {},
    {},
    { [key in keyof MoveableEvents]: (e: MoveableEvents[key]) => void }
      >({
        name: 'Moveable',
        props: PROPERTIES,
        watch,
        mounted(this: any) {
          const options: Partial<MoveableOptions> = {}
          const props = this.$props
          PROPERTIES.forEach((name) => {
            const value = props[name]

            if (!isUndefined(value)) {
              (options as any)[name] = props[name]
            }
          })
          const refs = this.$refs
          const moveableElement = refs.moveableElement

          const moveable = new VanillaMoveable(moveableElement, {
            ...options,
            warpSelf: true,
          })

          EVENTS.forEach((name) => {
            moveable.on(name as any, (e: any) => {
              this.$emit(name, { ...e })
            })
          })
          this.$_moveable = moveable
        },
        beforeUnmount(this: ComponentInstance) {
          this.$_moveable.destroy()
        },
        methods,
      } as any)

interface VueMoveable extends Partial<MoveableProperties>, MoveableInterface {
}

export default VueMoveable
</script>

<template>
  <div ref="moveableElement" />
</template>
