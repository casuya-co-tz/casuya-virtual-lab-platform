import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'

describe('search API routing', () => {
  it('allows browser search requests without a bearer token', async () => {
    const req = new NextRequest('http://localhost/api/search?q=physics')

    const res = await middleware(req)

    expect(res.status).toBe(200)
  })
})
