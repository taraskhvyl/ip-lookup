import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IpLookupRow from './IpLookupRow.vue'

function createRow(overrides: Partial<{
  id: string
  label: number
  ip: string
  status: 'idle' | 'loading' | 'success' | 'error'
  errorMessage: string
  result: { country: string; countryCode: string; timezone: string }
}> = {}) {
  return {
    id: 'row-0',
    label: 1,
    ip: '',
    status: 'idle' as const,
    ...overrides,
  }
}

describe('IpLookupRow', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders badge, input, and result area', () => {
    const row = createRow({ label: 1, ip: '' })
    const wrapper = mount(IpLookupRow, {
      props: { row },
      global: { stubs: { ZonedClockDisplay: true } },
    })
    expect(wrapper.text()).toContain('1')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toContain('127.0.0.1')
  })

  it('disables input when loading', () => {
    const row = createRow({ status: 'loading' })
    const wrapper = mount(IpLookupRow, {
      props: { row },
      global: { stubs: { ZonedClockDisplay: true } },
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Searching')
  })

  it('shows error message when status is error', () => {
    const row = createRow({ status: 'error', errorMessage: 'IP address is required' })
    const wrapper = mount(IpLookupRow, {
      props: { row },
      global: { stubs: { ZonedClockDisplay: true } },
    })
    expect(wrapper.text()).toContain('IP address is required')
  })

  it('shows flag and clock when success', () => {
    const row = createRow({
      status: 'success',
      result: { country: 'United States', countryCode: 'US', timezone: 'America/New_York' },
    })
    const wrapper = mount(IpLookupRow, {
      props: { row },
      global: { stubs: { ZonedClockDisplay: true } },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('us')
    expect(img.attributes('alt')).toBe('United States flag')
  })

  it('emits update on input', async () => {
    const row = createRow({ ip: '' })
    const wrapper = mount(IpLookupRow, {
      props: { row },
      global: { stubs: { ZonedClockDisplay: true } },
    })
    await wrapper.find('input').setValue('8.8.8.8')
    expect(wrapper.emitted('update')).toBeTruthy()
  })

  it('triggers lookup on blur', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ country: 'US', countryCode: 'US', timezone: 'America/New_York' }),
    } as Response)

    const row = createRow({ ip: '8.8.8.8' })
    const wrapper = mount(IpLookupRow, {
      props: { row },
      global: { stubs: { ZonedClockDisplay: true } },
    })
    await wrapper.find('input').trigger('blur')
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 50))
    expect(fetchMock).toHaveBeenCalled()
  })
})
