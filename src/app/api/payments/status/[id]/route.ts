import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'
import { getTransactionStatus } from '@/lib/azampay'

async function activateSubscription(userId: string, txId: string) {
  const txRow = await query(
    `SELECT plan_id, amount, provider_transaction_id FROM payment_transactions WHERE id = $1`,
    [txId]
  )
  if (txRow.rows.length === 0) return

  const tx = txRow.rows[0]
  const planResult = await query(
    `SELECT slug, interval FROM pricing_plans WHERE id = $1`,
    [tx.plan_id]
  )
  if (planResult.rows.length === 0) return

  const plan = planResult.rows[0]
  const intervalDays = plan.interval === 'yearly' ? 365 : 30
  const expiresAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)

  const existingSub = await query(
    `SELECT id, status FROM subscriptions WHERE user_id = $1 AND status = 'active'`,
    [userId]
  )

  if (existingSub.rows.length > 0) {
    await query(
      `UPDATE subscriptions SET tier = CASE
        WHEN $2 = 'free' THEN 'free'
        WHEN $2 = 'basic' THEN 'premium'
        WHEN $2 = 'pro' THEN 'premium'
        WHEN $2 = 'institution' THEN 'enterprise'
        ELSE tier END,
        plan_id = $3, status = 'active', expires_at = $4,
        provider = 'Azampesa', transaction_id = $5, amount = $6
      WHERE id = $1`,
      [existingSub.rows[0].id, plan.slug, tx.plan_id, expiresAt, tx.provider_transaction_id, tx.amount]
    )
  } else {
    const tierMapping: Record<string, string> = {
      free: 'free', basic: 'premium', pro: 'premium', institution: 'enterprise'
    }
    await query(
      `INSERT INTO subscriptions (user_id, tier, status, plan_id, expires_at, provider, transaction_id, amount, currency)
       VALUES ($1, $2, 'active', $3, $4, $5, $6, $7, 'TZS')`,
      [userId, tierMapping[plan.slug] || 'premium', tx.plan_id, expiresAt, tx.provider_transaction_id, tx.provider_transaction_id, tx.amount]
    )
  }

  if (plan.slug.startsWith('dev_')) {
    await query(
      `UPDATE developer_profiles SET plan_id = (SELECT id FROM pricing_plans WHERE slug = $1) WHERE id = $2`,
      [plan.slug, userId]
    )
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT id, plan_id, amount, currency, status, provider, provider_transaction_id, created_at, completed_at
       FROM payment_transactions WHERE id = $1 AND user_id = $2`,
      [params.id, userId]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const tx = result.rows[0]

    if (tx.status === 'pending' && process.env.AZAMPESA_APP_NAME) {
      try {
        const gatewayResult = await getTransactionStatus({
          pgReferenceId: tx.provider_transaction_id !== tx.id ? tx.provider_transaction_id : undefined,
          externalId: tx.id,
        })

        if (gatewayResult.success && gatewayResult.status?.toLowerCase() === 'completed') {
          await query(
            `UPDATE payment_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
            [tx.id]
          )
          await activateSubscription(userId, tx.id)
          tx.status = 'completed'
        } else if (gatewayResult.success && gatewayResult.status?.toLowerCase() === 'failed') {
          await query(
            `UPDATE payment_transactions SET status = 'failed', metadata = jsonb_set(COALESCE(metadata, '{}'), '{error}', $1::jsonb) WHERE id = $2`,
            [JSON.stringify(gatewayResult.resultDesc || 'Payment failed'), tx.id]
          )
          tx.status = 'failed'
        }
      } catch {
        // Gateway unreachable — return current DB status
      }
    }

    return NextResponse.json(tx)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
