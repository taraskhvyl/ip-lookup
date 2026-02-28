/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupGeoByIp } from './geo-lookup'

describe('lookupGeoByIp', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns error when ip is empty', async () => {
    const result = await lookupGeoByIp('')
    expect(result).toEqual({
      success: false,
      status: 400,
      error: 'Missing or empty ip query parameter',
    })
  })

  it('returns success for valid IP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
      }),
    }))

    const result = await lookupGeoByIp('8.8.8.8')

    expect(result).toEqual({
      success: true,
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/New_York',
    })
  })

  it('returns 404 when ip-api.com returns status: fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'fail',
        message: 'Reserved range',
      }),
    }))

    const result = await lookupGeoByIp('127.0.0.1')

    expect(result).toEqual({
      success: false,
      status: 404,
      error: 'Reserved range',
    })
  })

  it('handles network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await lookupGeoByIp('8.8.8.8')

    expect(result).toEqual({
      success: false,
      status: 500,
      error: 'Could not look up IP: Network error',
    })
  })
})
