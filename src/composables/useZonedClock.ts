/**
 * Composable for real-time clock display in a specific timezone.
 * Updates every second and cleans up interval on unmount.
 */

import { ref, onUnmounted } from 'vue'

export function useZonedClock(timezone: string) {
  const time = ref('')

  function updateTime() {
    const now = new Date()
    time.value = now.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  updateTime()
  const interval = setInterval(updateTime, 1000)

  onUnmounted(() => {
    clearInterval(interval)
  })

  return { time }
}
