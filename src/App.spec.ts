/**
 * Tests for App component - multi-row management logic.
 * Focus: Add button disable logic, row updates, accessibility (focus).
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from './App.vue'

describe('App', () => {
  describe('add button disable logic', () => {

  it('disables Add button when last row IP is empty', () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            IpLookupRow: {
              template: '<div></div>',
              props: ['row'],
            },
          },
        },
      })

      const addButton = wrapper.find('button')
      expect(addButton.attributes('disabled')).toBeDefined()
    })

    it('enables Add button when last row has IP', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            IpLookupRow: {
              template: '<div></div>',
              props: ['row'],
            },
          },
        },
      })

      const vm = wrapper.vm as unknown as {
        rows: Array<{ id: string; ip: string }>
        updateRow: (id: string, updates: Record<string, unknown>) => void
      }

      const rowId = vm.rows[0]?.id
      if (!rowId) throw new Error('No rows found')
      
      vm.updateRow(rowId, { ip: '8.8.8.8' })
      await nextTick()

      const addButton = wrapper.find('button')
      expect(addButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('row updates', () => {
    it('updates row data correctly', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            IpLookupRow: {
              template: '<div>{{ row.ip }} - {{ row.status }}</div>',
              props: ['row'],
            },
          },
        },
      })

      const vm = wrapper.vm as unknown as {
        rows: Array<{ id: string; ip: string; status: string }>
        updateRow: (id: string, updates: Record<string, unknown>) => void
      }

      const rowId = vm.rows[0]?.id
      if (!rowId) throw new Error('No rows found')
      
      vm.updateRow(rowId, { ip: '8.8.8.8', status: 'loading' })
      await nextTick()

      expect(vm.rows[0]?.ip).toBe('8.8.8.8')
      expect(vm.rows[0]?.status).toBe('loading')
    })

    it('does not overwrite fields with undefined', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            IpLookupRow: {
              template: '<div></div>',
              props: ['row'],
            },
          },
        },
      })

      const vm = wrapper.vm as unknown as {
        rows: Array<{ id: string; ip: string; status: string }>
        updateRow: (id: string, updates: Record<string, unknown>) => void
      }

      const rowId = vm.rows[0]?.id
      if (!rowId) throw new Error('No rows found')
      
      vm.updateRow(rowId, { ip: '8.8.8.8' })
      await nextTick()

      expect(vm.rows[0]?.ip).toBe('8.8.8.8')
      expect(vm.rows[0]?.status).toBe('idle')
    })
  })

  describe('accessibility', () => {
    it('focuses new input after adding row', async () => {
      document.body.innerHTML = '<div id="app"></div>'
      const wrapper = mount(App, {
        attachTo: '#app',
        global: {
          stubs: {
            IpLookupRow: {
              template: '<input :id="`ip-input-${row.id}`" />',
              props: ['row'],
            },
          },
        },
      })

      const vm = wrapper.vm as unknown as {
        rows: Array<{ id: string; ip: string }>
        updateRow: (id: string, updates: Record<string, unknown>) => void
      }

      const rowId = vm.rows[0]?.id
      if (!rowId) throw new Error('No rows found')
      
      vm.updateRow(rowId, { ip: '8.8.8.8' })
      await nextTick()

      const addButton = wrapper.find('button')
      await addButton.trigger('click')
      await nextTick()
      await nextTick()

      const inputs = document.querySelectorAll('input')
      expect(document.activeElement).toBe(inputs[inputs.length - 1])

      wrapper.unmount()
    })
  })
})
