import { query } from './db'

const STAFF_ROLES = new Set(['admin', 'teacher'])

export async function hasActivePremiumSubscription(userId: string): Promise<boolean> {
  const result = await query(
    `SELECT id FROM subscriptions
     WHERE user_id = $1 AND status = 'active' AND tier IN ('premium', 'enterprise')`,
    [userId]
  )
  return result.rows.length > 0
}

export async function canAccessPremiumContent(userId: string, role: string): Promise<boolean> {
  if (STAFF_ROLES.has(role)) return true
  return hasActivePremiumSubscription(userId)
}
