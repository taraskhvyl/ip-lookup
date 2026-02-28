<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useIpLookup } from '../composables/useIpLookup'
import ZonedClockDisplay from './ZonedClockDisplay.vue'

type Row = {
  id: string
  label: number
  ip: string
  status: 'idle' | 'loading' | 'success' | 'error'
  errorMessage?: string
  result?: {
    country: string
    countryCode: string
    timezone: string
  }
}

const props = defineProps<{ row: Row; autoFocus?: boolean }>()
const emit = defineEmits<{
  update: [updates: Partial<Row>]
}>()

const inputRef = ref<HTMLInputElement>()
const isDisabled = computed(() => props.row.status === 'loading')

watch(() => props.autoFocus, async (shouldFocus) => {
  if (shouldFocus) {
    await nextTick()
    inputRef.value?.focus()
  }
}, { immediate: true })

const { runLookup } = useIpLookup(
  () => props.row.ip,
  (updates) => emit('update', updates)
)

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update', { ip: target.value, status: 'idle', errorMessage: undefined })
}

function onBlur() {
  runLookup()
}
</script>

<template>
  <div class="flex items-center gap-3 py-2" role="listitem">
    <div
      class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
      :aria-label="`Row ${row.label}`"
    >
      {{ row.label }}
    </div>

    <div class="flex-1 min-w-0 relative">
      <label :for="`ip-input-${row.id}`" class="sr-only">IP address for row {{ row.label }}</label>
      <input
        ref="inputRef"
        :id="`ip-input-${row.id}`"
        :data-testid="`ip-input-${row.id}`"
        type="text"
        :value="row.ip"
        :disabled="isDisabled"
        placeholder="e.g. 127.0.0.1"
        :aria-describedby="row.status === 'error' ? `error-${row.id}` : undefined"
        :aria-invalid="row.status === 'error'"
        :class="[
          'w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
          row.status === 'error' ? 'border-red-500' : 'border-gray-300'
        ]"
        @input="onInput"
        @blur="onBlur"
      />
      <p v-if="row.status === 'error' && row.errorMessage" :id="`error-${row.id}`" class="absolute left-0 top-full mt-1 text-sm text-red-600 max-w-full" role="alert" :title="row.errorMessage">
        {{ row.errorMessage }}
      </p>
    </div>

    <div class="flex-shrink-0 w-48 flex items-center justify-end gap-2" role="status" :aria-live="row.status === 'loading' ? 'polite' : 'off'">
      <template v-if="row.status === 'loading'">
        <span class="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
        <span class="text-sm text-gray-500">Searching…</span>
      </template>
      <template v-else-if="row.status === 'success' && row.result">
        <img
          :src="`https://flagcdn.com/w40/${row.result.countryCode.toLowerCase()}.png`"
          :alt="`${row.result.country} flag`"
          class="w-6 h-4 object-cover rounded-sm"
          role="img"
        />
        <ZonedClockDisplay :timezone="row.result.timezone" />
      </template>
    </div>
  </div>
</template>
