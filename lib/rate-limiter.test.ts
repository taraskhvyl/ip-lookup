import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from './rate-limiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('blocks requests exceeding limit and resets after window', () => {
    const limiter = new RateLimiter(2, 60000)

    expect(limiter.check('user1').allowed).toBe(true)
    expect(limiter.check('user1').allowed).toBe(true)
    expect(limiter.check('user1').allowed).toBe(false)

    vi.advanceTimersByTime(60001)

    expect(limiter.check('user1').allowed).toBe(true)
  })
})
