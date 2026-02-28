/**
 * Tests for geoClient caching logic - the most critical business logic.
 * Focus: Cache behavior for success/errors, not basic fetch mechanics.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lookupIp } from './geoClient'

describe('geoClient caching', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  describe('cache hits', () => {
    it('caches successful results and returns from cache on second call', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          country: 'United States',
          countryCode: 'us',
          timezone: 'America/New_York',
        }),
      } as Response)

      const result1 = await lookupIp('8.8.8.8')
      const result2 = await lookupIp('8.8.8.8')

      expect(result1).toEqual(result2)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('permanent error caching', () => {
    it('caches 404 errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Could not resolve this IP address' }),
      } as Response)

      await expect(lookupIp('192.168.1.1')).rejects.toThrow('Could not resolve this IP address')
      await expect(lookupIp('192.168.1.1')).rejects.toThrow('Could not resolve this IP address')

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('caches 400 errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid IP' }),
      } as Response)

      await expect(lookupIp('invalid')).rejects.toThrow('Invalid IP')
      await expect(lookupIp('invalid')).rejects.toThrow('Invalid IP')

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('caches "reserved range" errors (permanent)', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ error: 'reserved range' }),
      } as Response)

      await expect(lookupIp('127.0.0.1')).rejects.toThrow('reserved range')
      await expect(lookupIp('127.0.0.1')).rejects.toThrow('reserved range')

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('temporary error non-caching', () => {

    it('does NOT cache 500 errors - allows retry', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response)

      await expect(lookupIp('9.9.9.9')).rejects.toThrow('Internal server error')
      await expect(lookupIp('9.9.9.9')).rejects.toThrow('Internal server error')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('does NOT cache 429 rate limit errors - allows retry', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many requests' }),
      } as Response)

      await expect(lookupIp('10.10.10.10')).rejects.toThrow('Too many requests')
      await expect(lookupIp('10.10.10.10')).rejects.toThrow('Too many requests')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
