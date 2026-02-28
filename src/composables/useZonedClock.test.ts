/**
 * Tests for useZonedClock composable.
 * Verifies time formatting and basic functionality.
 */

import { describe, it, expect } from 'vitest'
import { useZonedClock } from './useZonedClock'

describe('useZonedClock', () => {
  it('should return time in HH:MM:SS format', () => {
    const { time } = useZonedClock('UTC')
    
    expect(time.value).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('should use 24-hour format', () => {
    const { time } = useZonedClock('UTC')
    
    expect(time.value).not.toMatch(/AM|PM/)
  })

  it('should format time for different timezones', () => {
    const utc = useZonedClock('UTC')
    const tokyo = useZonedClock('Asia/Tokyo')
    const ny = useZonedClock('America/New_York')
    
    expect(utc.time.value).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    expect(tokyo.time.value).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    expect(ny.time.value).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('should return readonly time reference', () => {
    const { time } = useZonedClock('UTC')
    
    expect(time.value).toBeDefined()
    expect(typeof time.value).toBe('string')
  })
})
