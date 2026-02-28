import { describe, it, expect } from 'vitest'
import { validateIp } from './ip'

describe('validateIp', () => {
  it('rejects empty string', () => {
    expect(validateIp('').valid).toBe(false)
    expect(validateIp('   ').valid).toBe(false)
    expect(validateIp('').error).toBe('IP address is required')
  })

  it('accepts valid IPv4 addresses', () => {
    expect(validateIp('127.0.0.1').valid).toBe(true)
    expect(validateIp('192.168.1.1').valid).toBe(true)
    expect(validateIp('8.8.8.8').valid).toBe(true)
    expect(validateIp('255.255.255.255').valid).toBe(true)
    expect(validateIp('  192.168.1.1  ').valid).toBe(true)
  })

  it('accepts valid IPv6 addresses', () => {
    expect(validateIp('::1').valid).toBe(true)
    expect(validateIp('2001:db8::1').valid).toBe(true)
    expect(validateIp('fe80::1').valid).toBe(true)
  })

  it('rejects invalid addresses', () => {
    expect(validateIp('256.1.1.1').valid).toBe(false)
    expect(validateIp('1.2.3.4.5').valid).toBe(false)
    expect(validateIp('not-an-ip').valid).toBe(false)
    expect(validateIp('').error).toContain('required')
    expect(validateIp('invalid').error).toContain('valid')
  })

  it('rejects incomplete IPv4 addresses', () => {
    expect(validateIp('188.13').valid).toBe(false)
    expect(validateIp('192.168.1').valid).toBe(false)
    expect(validateIp('10').valid).toBe(false)
    expect(validateIp('1.2').valid).toBe(false)
    expect(validateIp('1.2.3').valid).toBe(false)
    expect(validateIp('1.2.3.4.5').valid).toBe(false)
  })
})
