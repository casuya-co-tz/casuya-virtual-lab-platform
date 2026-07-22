import { describe, expect, it } from 'vitest'
import { getSessionUserFromCookie } from '../session-role'

describe('getSessionUserFromCookie', () => {
  it('returns the user role from the session cookies when both cookies are present', () => {
    const user = getSessionUserFromCookie('user-123', 'admin')

    expect(user).toEqual({ id: 'user-123', role: 'admin' })
  })

  it('returns null when the session cookie or role cookie is missing', () => {
    expect(getSessionUserFromCookie(null, 'admin')).toBeNull()
    expect(getSessionUserFromCookie('user-123', null)).toBeNull()
  })
})
