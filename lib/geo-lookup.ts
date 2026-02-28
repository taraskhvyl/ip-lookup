/**
 * Shared IP geolocation logic used by both Vercel API handler and dev proxy.
 * Calls ip-api.com and normalizes the response.
 */

export interface GeoSuccess {
  success: true
  country: string
  countryCode: string
  timezone: string
}

export interface GeoError {
  success: false
  status: number
  error: string
}

export type GeoResult = GeoSuccess | GeoError

/**
 * Fetches geolocation data for an IP address from ip-api.com.
 * Returns normalized result with country, countryCode, and timezone.
 */
export async function lookupGeoByIp(ip: string): Promise<GeoResult> {
  const trimmed = ip.trim()
  if (!trimmed) {
    return { success: false, status: 400, error: 'Missing or empty ip query parameter' }
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(trimmed)}`)
    const data = (await response.json()) as {
      status?: string
      country?: string
      countryCode?: string
      timezone?: string
      message?: string
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data?.message ?? 'IP lookup failed',
      }
    }

    if (data.status === 'fail') {
      return {
        success: false,
        status: 404,
        error: data.message ?? 'Could not resolve this IP address',
      }
    }

    return {
      success: true,
      country: data.country ?? 'Unknown',
      countryCode: (data.countryCode ?? 'XX').toUpperCase(),
      timezone: data.timezone ?? 'UTC',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, status: 500, error: `Could not look up IP: ${message}` }
  }
}
