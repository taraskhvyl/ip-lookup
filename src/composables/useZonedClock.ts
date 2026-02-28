/**
 * Composable for real-time clock display in a specific timezone.
 * Uses a single shared timer for all clock instances.
 */

import { ref, computed, onUnmounted, readonly } from 'vue'

const currentTime = ref(new Date())
let subscriberCount = 0
let interval: ReturnType<typeof setInterval> | undefined

function startGlobalTimer() {
  if (interval) return

  function updateGlobalTime() {
    currentTime.value = new Date()
  }

  const now = new Date()
  const msUntilNextSecond = 1000 - now.getMilliseconds()
  
  setTimeout(() => {
    updateGlobalTime()
    interval = setInterval(updateGlobalTime, 1000)
  }, msUntilNextSecond)
}

function stopGlobalTimer() {
  if (subscriberCount === 0 && interval) {
    clearInterval(interval)
    interval = undefined
  }
}

export function useZonedClock(timezone: string) {
  subscriberCount++
  startGlobalTimer()

  const time = computed(() => {
    return currentTime.value.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  })

  onUnmounted(() => {
    subscriberCount--
    stopGlobalTimer()
  })

  return { time: readonly(time) }
}
