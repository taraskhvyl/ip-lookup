<script setup lang="ts">
import { ref, computed } from 'vue'
import IpLookupRow from './components/IpLookupRow.vue'

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

let nextId = 0
const rows = ref<Row[]>([
  {
    id: `row-${nextId++}`,
    label: 1,
    ip: '',
    status: 'idle',
  },
])

function addRow() {
  const newId = `row-${nextId++}`
  rows.value.push({
    id: newId,
    label: rows.value.length + 1,
    ip: '',
    status: 'idle',
  })
}

function updateRow(id: string, updates: Partial<Row>) {
  const idx = rows.value.findIndex((r) => r.id === id)
  if (idx !== -1) {
    const current = rows.value[idx]
    const merged = { ...current }
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) {
        ;(merged as Record<string, unknown>)[k] = v
      }
    }
    rows.value[idx] = merged as Row
  }
}

const isAddDisabled = computed(() => {
  const lastRow = rows.value[rows.value.length - 1]
  return !lastRow || lastRow.ip.trim() === ''
})
</script>

<template>
  <div class="w-full max-w-2xl mx-4">
    <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
      <header class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">IP Lookup</h1>
      </header>

      <div class="px-6 py-4 space-y-4">
        <p class="text-sm text-gray-600">Enter one or more IP addresses and get their country</p>

        <button
          type="button"
          @click="addRow"
          :disabled="isAddDisabled"
          class="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isAddDisabled ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'"
          aria-label="Add new IP address row"
        >
          <span aria-hidden="true">+</span>
          Add
        </button>

        <div class="border-t border-gray-200 pt-4 space-y-3 pb-4" role="list" aria-label="IP address lookup rows">
          <IpLookupRow
            v-for="(row, index) in rows"
            :key="row.id"
            :row="row"
            :auto-focus="index === rows.length - 1 && rows.length > 1"
            @update="(updates: Partial<Row>) => updateRow(row.id, updates)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
