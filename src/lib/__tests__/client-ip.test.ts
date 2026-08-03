import { describe, expect, it } from 'vitest'
import { getClientIp } from '../client-ip'

describe('getClientIp', () => {
  it('takes the first hop of a well-formed x-forwarded-for chain', () => {
    expect(getClientIp('203.0.113.7, 10.0.0.1, 10.0.0.2')).toBe('203.0.113.7')
  })

  it('accepts IPv6 literals', () => {
    expect(getClientIp('2001:db8::1, 10.0.0.1')).toBe('2001:db8::1')
    expect(getClientIp('[2001:db8::1]:443, 10.0.0.1')).toBe('2001:db8::1')
  })

  it('strips a port from an IPv4 literal', () => {
    expect(getClientIp('203.0.113.7:9999, 10.0.0.1')).toBe('203.0.113.7')
  })

  it('rejects spoofed garbage in the header', () => {
    expect(getClientIp('not-an-ip, 10.0.0.1')).toBe('unknown')
    expect(getClientIp('<script>alert(1)</script>')).toBe('unknown')
    expect(getClientIp('../../etc/passwd')).toBe('unknown')
  })

  it('falls back to the runtime ip when the header is absent', () => {
    expect(getClientIp(null, '198.51.100.3')).toBe('198.51.100.3')
  })

  it('returns unknown when nothing is usable', () => {
    expect(getClientIp(null, null)).toBe('unknown')
    expect(getClientIp('', '')).toBe('unknown')
  })
})
