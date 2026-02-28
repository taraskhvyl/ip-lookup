/**
 * Tests for useIpLookup composable - orchestration logic.
 * Focus: Validation flow, abort behavior, state transitions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIpLookup } from './useIpLookup'
import * as geoClient from '../api/geoClient'
import * as ipUtils from '../utils/ip'

vi.mock('../api/geoClient')
vi.mock('../utils/ip')

describe('useIpLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation flow', () => {
    it('validates IP before lookup and shows error on invalid', async () => {
      vi.spyOn(ipUtils, 'validateIp').mockReturnValue({
        valid: false,
        error: 'IP address is required',
      })
      const onUpdate = vi.fn()

      const { runLookup } = useIpLookup(() => '', onUpdate)
      await runLookup()

      expect(onUpdate).toHaveBeenCalledWith({
        status: 'error',
        errorMessage: 'IP address is required',
        result: undefined,
      })
    })

    it('proceeds to lookup on valid IP', async () => {
      vi.spyOn(ipUtils, 'validateIp').mockReturnValue({ valid: true })
      vi.spyOn(geoClient, 'lookupIp').mockResolvedValue({
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
      })
      const onUpdate = vi.fn()

      const { runLookup } = useIpLookup(() => '8.8.8.8', onUpdate)
      await runLookup()

      expect(onUpdate).toHaveBeenCalledWith({
        status: 'success',
        result: {
          country: 'United States',
          countryCode: 'US',
          timezone: 'America/New_York',
        },
        errorMessage: undefined,
      })
    })
  })

  describe('error handling', () => {
    it('handles API errors correctly', async () => {
      vi.spyOn(ipUtils, 'validateIp').mockReturnValue({ valid: true })
      vi.spyOn(geoClient, 'lookupIp').mockRejectedValue(new Error('Could not resolve this IP address'))
      const onUpdate = vi.fn()

      const { runLookup } = useIpLookup(() => '192.168.1.1', onUpdate)
      await runLookup()

      expect(onUpdate).toHaveBeenCalledWith({
        status: 'error',
        errorMessage: 'Could not resolve this IP address',
        result: undefined,
      })
    })
  })

  describe('abort behavior', () => {

  it('aborts previous request when new lookup starts', async () => {
      vi.spyOn(ipUtils, 'validateIp').mockReturnValue({ valid: true })
      
      let firstAbortSignal: AbortSignal | undefined
      let secondAbortSignal: AbortSignal | undefined
      
      vi.spyOn(geoClient, 'lookupIp').mockImplementation(
        async (_ip: string, signal?: AbortSignal) => {
          if (!firstAbortSignal) {
            firstAbortSignal = signal
            await new Promise(resolve => setTimeout(resolve, 100))
          } else {
            secondAbortSignal = signal
          }
          return {
            country: 'United States',
            countryCode: 'US',
            timezone: 'America/New_York',
          }
        }
      )
      const onUpdate = vi.fn()

      const { runLookup } = useIpLookup(() => '8.8.8.8', onUpdate)
      
      runLookup()
      await new Promise(resolve => setTimeout(resolve, 10))
      runLookup()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(firstAbortSignal?.aborted).toBe(true)
      expect(secondAbortSignal?.aborted).toBe(false)
    })
  })
})
