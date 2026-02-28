import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isOriginAllowed, getClientIp } from './security'

describe('security', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('validates allowed origins', () => {
    process.env.VERCEL_URL = 'myapp.vercel.app'
    
    expect(isOriginAllowed('https://myapp.vercel.app')).toBe(true)
    expect(isOriginAllowed('https://evil.com')).toBe(false)
    expect(isOriginAllowed(undefined)).toBe(false)
  })

  it('extracts client IP from headers', () => {
    expect(getClientIp({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })).toBe('1.2.3.4')
    expect(getClientIp({ 'x-real-ip': '9.8.7.6' })).toBe('9.8.7.6')
    expect(getClientIp({})).toBe('unknown')
  })
})
