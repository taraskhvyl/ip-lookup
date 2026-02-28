/**
 * Vite dev server plugin that proxies /api/geo requests to ip-api.com.
 * Mimics the production Vercel serverless function behavior during local development.
 */

import type { Plugin } from 'vite'
import { lookupGeoByIp } from '../lib/geo-lookup'

const HEADERS = {
  'Content-Type': 'application/json',
}

export function devGeoProxy(): Plugin {
  return {
    name: 'api-geo-proxy',
    configureServer(server) {
      server.middlewares.use('/api/geo', async (req, res) => {
        const match = (req.url ?? '').match(/[?&]ip=([^&]+)/)
        const ip = match ? decodeURIComponent(match[1]) : ''
        const result = await lookupGeoByIp(ip)

        if (result.success) {
          res.writeHead(200, HEADERS)
          res.end(JSON.stringify({ country: result.country, countryCode: result.countryCode, timezone: result.timezone }))
        } else {
          res.writeHead(result.status, HEADERS)
          res.end(JSON.stringify({ error: result.error }))
        }
      })
    },
  }
}
