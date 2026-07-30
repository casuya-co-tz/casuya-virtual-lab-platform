import { describe, expect, it, vi, beforeEach } from 'vitest'
import { canAccessPremiumContent, hasActivePremiumSubscription } from '../subscription-access'

vi.mock('../db', () => ({
  query: vi.fn(),
}))

import { query } from '../db'

const mockedQuery = vi.mocked(query)

describe('subscription-access', () => {
  beforeEach(() => {
    mockedQuery.mockReset()
  })

  describe('hasActivePremiumSubscription', () => {
    it('returns true when user has an active premium subscription', async () => {
      mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'sub-1' }] } as never)
      await expect(hasActivePremiumSubscription('user-1')).resolves.toBe(true)
    })

    it('returns false when user has no active premium subscription', async () => {
      mockedQuery.mockResolvedValueOnce({ rows: [] } as never)
      await expect(hasActivePremiumSubscription('user-1')).resolves.toBe(false)
    })
  })

  describe('canAccessPremiumContent', () => {
    it('allows admin without checking subscription', async () => {
      await expect(canAccessPremiumContent('user-1', 'admin')).resolves.toBe(true)
      expect(mockedQuery).not.toHaveBeenCalled()
    })

    it('allows teacher without checking subscription', async () => {
      await expect(canAccessPremiumContent('user-1', 'teacher')).resolves.toBe(true)
      expect(mockedQuery).not.toHaveBeenCalled()
    })

    it('checks subscription for students', async () => {
      mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'sub-1' }] } as never)
      await expect(canAccessPremiumContent('user-1', 'student')).resolves.toBe(true)
      expect(mockedQuery).toHaveBeenCalledOnce()
    })
  })
})
