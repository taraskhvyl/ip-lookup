/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('geo API handler', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('returns 403 when origin is not allowed', async () => {
    const handler = (await import('./geo.js')).default
    const req = {
      method: 'GET',
      query: { ip: '8.8.8.8' },
      headers: { origin: 'https://evil.com' },
    }
    const res = {
      statusCode: 0,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(body: object) {
        this.body = body
        return this
      },
      body: null as object | null,
      setHeader: vi.fn(),
      end: vi.fn(),
    }

    await handler(req as unknown as Parameters<typeof handler>[0], res as unknown as Parameters<typeof handler>[1])

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ error: 'Forbidden: Invalid origin' })
  })

  it('normalizes successful ip-api.com response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
      }),
    })
    vi.stubGlobal('fetch', mockFetch)
    process.env.VERCEL_URL = 'test.vercel.app'

    const handler = (await import('./geo.js')).default

    const req = {
      method: 'GET',
      query: { ip: '8.8.8.8' },
      headers: { origin: 'https://test.vercel.app' },
    }
    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(body: object) {
        this.body = body
        return this
      },
      body: null as object | null,
      setHeader() {},
      end() {},
    }

    await handler(req as unknown as Parameters<typeof handler>[0], res as unknown as Parameters<typeof handler>[1])

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/New_York',
    })
  })

  it('returns 400 when ip is missing', async () => {
    process.env.VERCEL_URL = 'test.vercel.app'
    const handler = (await import('./geo.js')).default
    const req = { method: 'GET', query: {}, headers: { origin: 'https://test.vercel.app' } }
    const res = {
      statusCode: 0,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(body: object) {
        this.body = body
        return this
      },
      body: null as object | null,
      setHeader: vi.fn(),
      end: vi.fn(),
    }

    await handler(req as unknown as Parameters<typeof handler>[0], res as unknown as Parameters<typeof handler>[1])

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 404 when upstream says status: fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'fail', message: 'Reserved range' }),
    }))
    process.env.VERCEL_URL = 'test.vercel.app'

    const handler = (await import('./geo.js')).default
    const req = { method: 'GET', query: { ip: '127.0.0.1' }, headers: { origin: 'https://test.vercel.app' } }
    const res = {
      statusCode: 0,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(body: object) {
        this.body = body
        return this
      },
      body: null as object | null,
      setHeader: vi.fn(),
      end: vi.fn(),
    }

    await handler(req as unknown as Parameters<typeof handler>[0], res as unknown as Parameters<typeof handler>[1])

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Reserved range' })
  })
})
