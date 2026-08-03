import { query } from './db'
import type { QueryResult } from 'pg'

const STAFF_ROLES = new Set(['admin', 'teacher'])

export async function hasActivePremiumSubscription(userId: string): Promise<boolean> {
  const result = await query(
    `SELECT id FROM subscriptions
     WHERE user_id = $1 AND status = 'active' AND tier IN ('premium', 'enterprise')
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId]
  )
  return result.rows.length > 0
}

export async function canAccessPremiumContent(userId: string, role: string): Promise<boolean> {
  if (STAFF_ROLES.has(role)) return true
  return hasActivePremiumSubscription(userId)
}

const TIER_MAPPING: Record<string, string> = {
  free: 'free',
  basic: 'premium',
  pro: 'premium',
  institution: 'enterprise',
}

type QueryFn = (text: string, params?: unknown[]) => Promise<QueryResult>

/**
 * Idempotently activate/renew a subscription from a completed payment transaction.
 * Safe to call from both the payment webhook and the client status poll — the
 * active-subscription unique index prevents duplicate rows, and renewals extend
 * the existing expiry instead of resetting the clock.
 */
export async function activateSubscriptionForTransaction(
  userId: string,
  txId: string,
  q: QueryFn = query
): Promise<void> {
  const txRow = await q(
    `SELECT plan_id, amount, provider_transaction_id FROM payment_transactions WHERE id = $1`,
    [txId]
  )
  if (txRow.rows.length === 0) return

  const tx = txRow.rows[0]
  const planResult = await q(
    `SELECT slug, interval, currency FROM pricing_plans WHERE id = $1`,
    [tx.plan_id]
  )
  if (planResult.rows.length === 0) return

  const plan = planResult.rows[0]
  const intervalDays = plan.interval === 'yearly' ? 365 : 30
  const intervalSql = `INTERVAL '${intervalDays} days'`
  const tier = TIER_MAPPING[plan.slug] || 'premium'
  const providerRef = tx.provider_transaction_id || txId

  const updated = await q(
    `UPDATE subscriptions
     SET tier = $2, plan_id = $3, status = 'active',
         expires_at = GREATEST(expires_at, NOW()) + ${intervalSql},
         provider = $4, transaction_id = $5, amount = $6
     WHERE user_id = $1 AND status = 'active'
     RETURNING id`,
    [userId, tier, tx.plan_id, 'Azampesa', providerRef, tx.amount]
  )

  if (updated.rows.length === 0) {
    await q(
      `INSERT INTO subscriptions (user_id, tier, status, plan_id, expires_at, provider, transaction_id, amount, currency)
       SELECT $1, $2, 'active', $3, NOW() + ${intervalSql}, $4, $5, $6, $7
       WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = $1 AND status = 'active')
       ON CONFLICT (user_id) WHERE status = 'active' DO NOTHING`,
      [userId, tier, tx.plan_id, 'Azampesa', providerRef, tx.amount, plan.currency || 'TZS']
    )
  }

  if (plan.slug.startsWith('dev_')) {
    await q(
      `UPDATE developer_profiles SET plan_id = (SELECT id FROM pricing_plans WHERE slug = $1) WHERE id = $2`,
      [plan.slug, userId]
    )
  }
}
