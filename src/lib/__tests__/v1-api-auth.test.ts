import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'
import { isDeveloperKeyFormat, parseBearerToken } from '../api-key-format'

describe('api-key-format', () => {
  it('parses bearer tokens', () => {
    expect(parseBearerToken('Bearer cvs_abc:secret123')).toBe('cvs_abc:secret123')
    expect(parseBearerToken('Basic abc')).toBeNull()
    expect(parseBearerToken(null)).toBeNull()
  })

  it('accepts developer key format public_token:secret', () => {
    expect(isDeveloperKeyFormat('cvs_abc123:deadbeef')).toBe(true)
    expect(isDeveloperKeyFormat('cvs_only')).toBe(false)
    expect(isDeveloperKeyFormat('')).toBe(false)
  })
})

describe('v1 API routing', () => {
  it('allows public v1 requests without a bearer token', async () => {
    const req = new NextRequest('http://localhost/api/v1/public')
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })

  it('rejects protected v1 requests without developer key format', async () => {
    const req = new NextRequest('http://localhost/api/v1/labs')
    const res = await middleware(req)
    expect(res.status).toBe(401)
  })

  it('passes protected v1 requests with developer key format to route handlers', async () => {
    const req = new NextRequest('http://localhost/api/v1/labs', {
      headers: { authorization: 'Bearer cvs_testtoken:testsecret' },
    })
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })
})
