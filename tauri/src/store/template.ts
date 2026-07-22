import type { PrintTemplateEntity } from '@iprint/core'
import { init, PrintTemplate } from '@iprint/core'
import { createGlobalState } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'

let initialized = false

function ensureInit() {
  if (initialized)
    return
  initialized = true
  init()
}

export const useTemplate = createGlobalState(() => {
  ensureInit()
  const templateRef = shallowRef<PrintTemplate | null>(null)
  const printData = ref<Record<string, any>>({})
  const templateJson = ref<PrintTemplateEntity>({ panels: [] })

  function createTemplate(options: { template?: PrintTemplateEntity, settingContainer?: string } = {}) {
    const tpl = new PrintTemplate({
      template: options.template,
      settingContainer: options.settingContainer || '#PrintElementOptionSetting',
    })
    templateRef.value = tpl
    if (options.template)
      templateJson.value = options.template
    return tpl
  }

  function getOrCreate(): PrintTemplate {
    if (!templateRef.value)
      createTemplate()
    return templateRef.value!
  }

  const hasTemplate = computed(() => !!templateRef.value)

  return {
    template: computed(() => templateRef.value),
    templateRef,
    printData,
    templateJson,
    createTemplate,
    getOrCreate,
    hasTemplate,
  }
})
