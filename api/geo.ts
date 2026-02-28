/**
 * Vercel serverless function for IP geolocation lookups.
 * Implements in-memory rate limiting (10 req/min per IP).
 * Proxies requests to ip-api.com to hide the upstream provider.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { lookupGeoByIp } from '../lib/geo-lookup';

const rateMap = new Map<string, { count: number; resetAt: number; }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    'unknown';
  const now = Date.now();
  const record = rateMap.get(clientIp);

  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }
    record.count++;
  } else {
    rateMap.set(clientIp, { count: 1, resetAt: now + RATE_WINDOW });
  }

  const ip = typeof req.query.ip === 'string' ? req.query.ip : req.query.ip?.[0];
  const result = await lookupGeoByIp(ip ?? '');

  if (result.success) {
    res.status(200).json({
      country: result.country,
      countryCode: result.countryCode,
      timezone: result.timezone,
    });
  } else {
    res.status(result.status).json({ error: result.error });
  }
}
