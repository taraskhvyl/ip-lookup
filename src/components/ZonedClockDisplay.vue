<script setup lang="ts">
import { useZonedClock } from '../composables/useZonedClock'

const props = defineProps<{
  timezone: string
}>()

const { time } = useZonedClock(props.timezone)
</script>

<template>
  <span class="text-xs sm:text-sm font-mono text-gray-700" :aria-label="`Current time in ${timezone}`">
    {{ time }}
  </span>
</template>
