/**
 * Tests for useZonedClock composable.
 * Verifies time formatting and basic functionality.
 */

/* eslint-disable vue/one-component-per-file */

import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useZonedClock } from './useZonedClock'

describe('useZonedClock', () => {
  it('should return time in HH:MM:SS format', () => {
    const wrapper = mount(defineComponent({
      setup() {
        return useZonedClock('UTC')
      },
      template: '<div>{{ time }}</div>'
    }))
    
    expect(wrapper.text()).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    wrapper.unmount()
  })

  it('should use 24-hour format', () => {
    const wrapper = mount(defineComponent({
      setup() {
        return useZonedClock('UTC')
      },
      template: '<div>{{ time }}</div>'
    }))
    
    expect(wrapper.text()).not.toMatch(/AM|PM/)
    wrapper.unmount()
  })

  it('should format time for different timezones', () => {
    const utcWrapper = mount(defineComponent({
      setup() {
        return useZonedClock('UTC')
      },
      template: '<div>{{ time }}</div>'
    }))
    
    const tokyoWrapper = mount(defineComponent({
      setup() {
        return useZonedClock('Asia/Tokyo')
      },
      template: '<div>{{ time }}</div>'
    }))
    
    const nyWrapper = mount(defineComponent({
      setup() {
        return useZonedClock('America/New_York')
      },
      template: '<div>{{ time }}</div>'
    }))
    
    expect(utcWrapper.text()).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    expect(tokyoWrapper.text()).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    expect(nyWrapper.text()).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    
    utcWrapper.unmount()
    tokyoWrapper.unmount()
    nyWrapper.unmount()
  })

  it('should return readonly time reference', () => {
    const wrapper = mount(defineComponent({
      setup() {
        const { time } = useZonedClock('UTC')
        return { time, timeType: typeof time.value }
      },
      template: '<div>{{ timeType }}</div>'
    }))
    
    expect(wrapper.text()).toBe('string')
    wrapper.unmount()
  })
})
