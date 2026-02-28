/**
 * Client for IP geolocation lookups via /api/geo proxy.
 * Implements in-memory caching for both successful and permanent error responses.
 */

export interface GeoResult {
  country: string
  countryCode: string
  timezone: string
}

export interface GeoError {
  error: string
}

type CacheEntry = 
  | { type: 'success'; result: GeoResult }
  | { type: 'error'; message: string }

const cache = new Map<string, CacheEntry>()

const CACHEABLE_ERRORS = [
  'reserved range',
  'private range',
  'invalid ip',
  'could not resolve this ip address',
]

/**
 * Determines if an error should be cached (permanent errors like "reserved range").
 * Temporary errors (5xx, network issues) are not cached to allow retries.
 */
function isCacheableError(message: string): boolean {
  const lower = message.toLowerCase()
  return CACHEABLE_ERRORS.some(pattern => lower.includes(pattern))
}

/**
 * Looks up IP geolocation via /api/geo with caching.
 * Caches successful results and permanent errors (404, 400, reserved ranges).
 * Does not cache temporary failures (5xx, network errors, rate limits).
 */
export async function lookupIp(ip: string, signal?: AbortSignal): Promise<GeoResult> {
  const trimmed = ip.trim()

  const cached = cache.get(trimmed)
  if (cached) {
    if (cached.type === 'success') {
      return cached.result
    } else {
      throw new Error(cached.message)
    }
  }

  const url = new URL('/api/geo', window.location.origin)
  url.searchParams.set('ip', trimmed)

  const response = await fetch(url.toString(), { signal })
  const body = (await response.json()) as GeoResult | GeoError

  if (!response.ok) {
    const msg = 'error' in body ? body.error : 'IP lookup failed'
    if (response.status === 404 || response.status === 400 || isCacheableError(msg)) {
      cache.set(trimmed, { type: 'error', message: msg })
    }
    throw new Error(msg)
  }

  if ('error' in body) {
    if (isCacheableError(body.error)) {
      cache.set(trimmed, { type: 'error', message: body.error })
    }
    throw new Error(body.error)
  }

  const result = {
    country: body.country,
    countryCode: body.countryCode.toUpperCase(),
    timezone: body.timezone || 'UTC',
  }

  cache.set(trimmed, { type: 'success', result })
  return result
}
