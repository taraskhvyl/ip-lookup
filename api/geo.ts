/**
 * Vercel serverless function for IP geolocation lookups.
 * Security: Origin validation + CORS + rate limiting (10 req/min per IP)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { lookupGeoByIp } from '../lib/geo-lookup.js';
import { isOriginAllowed, getClientIp } from '../lib/security.js';
import { RateLimiter } from '../lib/rate-limiter.js';

const rateLimiter = new RateLimiter(10, 60000);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = req.headers.origin || req.headers.referer;
  
  if (!isOriginAllowed(origin)) {
    res.status(403).json({ error: 'Forbidden: Invalid origin' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin as string);
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const clientIp = getClientIp(req.headers);
  const { allowed } = rateLimiter.check(clientIp);

  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const ip = typeof req.query.ip === 'string' ? req.query.ip : req.query.ip?.[0];
  const result = await lookupGeoByIp(ip ?? '');

  if (result.success) {
    res.status(200).json({
      country: result.country,
      countryCode: result.countryCode,
      timezone: result.timezone,
    });
    return;
  }

  res.status(result.status).json({ error: result.error });
}
