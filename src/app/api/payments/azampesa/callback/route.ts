import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyWebhookChecksum } from '@/lib/azampay'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (process.env.AZAMPESA_APP_NAME) {
      const apiKey = process.env.AZAMPESA_API_KEY
      if (!apiKey) {
        return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 503 })
      }
      const signature = req.headers.get('x-checksum') || body.checksum
      if (!signature || typeof signature !== 'string') {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      const { checksum: _checksum, ...payloadForVerify } = body
      if (!verifyWebhookChecksum(apiKey, payloadForVerify, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const {
      externalId,
      transactionId: providerTxId,
      status,
      resultCode,
      resultDesc,
      amount,
    } = body

    const refId = externalId || providerTxId
    if (!refId) {
      return NextResponse.json({ error: 'Missing reference ID' }, { status: 400 })
    }

    const txResult = await query(
      `SELECT id, user_id, plan_id FROM payment_transactions WHERE id = $1 OR provider_transaction_id = $1`,
      [refId]
    )

    if (txResult.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const tx = txResult.rows[0]

    const success = status === 'Completed' || status === 'completed' || resultCode === 0 || resultCode === '0'

    if (success) {
      await query(
        `UPDATE payment_transactions SET status = 'completed', completed_at = NOW(),
         provider_transaction_id = COALESCE(provider_transaction_id, $1) WHERE id = $2`,
        [providerTxId, tx.id]
      )

      const planResult = await query(
        `SELECT slug, interval FROM pricing_plans WHERE id = $1`,
        [tx.plan_id]
      )

      if (planResult.rows.length > 0) {
        const plan = planResult.rows[0]
        const intervalDays = plan.interval === 'yearly' ? 365 : 30
        const expiresAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)

        const existingSub = await query(
          `SELECT id, status FROM subscriptions WHERE user_id = $1 AND status = 'active'`,
          [tx.user_id]
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
            [existingSub.rows[0].id, plan.slug, tx.plan_id, expiresAt, providerTxId, amount]
          )
        } else {
          const tierMapping: Record<string, string> = {
            free: 'free', basic: 'premium', pro: 'premium', institution: 'enterprise'
          }
          await query(
            `INSERT INTO subscriptions (user_id, tier, status, plan_id, expires_at, provider, transaction_id, amount, currency)
             VALUES ($1, $2, 'active', $3, $4, 'Azampesa', $5, $6, 'TZS')`,
            [tx.user_id, tierMapping[plan.slug] || 'premium', tx.plan_id, expiresAt, providerTxId, amount]
          )
        }

        if (plan.slug.startsWith('dev_')) {
          await query(
            `UPDATE developer_profiles SET plan_id = (SELECT id FROM pricing_plans WHERE slug = $1) WHERE id = $2`,
            [plan.slug, tx.user_id]
          )
        }
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed' })
    } else {
      await query(
        `UPDATE payment_transactions SET status = 'failed', metadata = jsonb_set(COALESCE(metadata, '{}'), '{error}', $1::jsonb) WHERE id = $2`,
        [JSON.stringify(resultDesc || 'Payment failed'), tx.id]
      )
      return NextResponse.json({ success: false, message: resultDesc || 'Payment failed' })
    }
  } catch (err) {
    console.error('Payment callback error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
