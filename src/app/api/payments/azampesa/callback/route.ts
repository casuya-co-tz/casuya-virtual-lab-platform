import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-azampesa-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const secret = process.env.AZAMPESA_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
  }

  const expectedSig = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`
  const sigBuf = Buffer.from(expectedSig)
  const headerBuf = Buffer.from(signature)
  if (sigBuf.length !== headerBuf.length || !crypto.timingSafeEqual(sigBuf, headerBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const data = JSON.parse(body)
  const { TransactionID, ResultCode, ResultDesc, Amount, PhoneNumber } = data

  if (!TransactionID) {
    return NextResponse.json({ error: 'Missing TransactionID' }, { status: 400 })
  }

  try {
    const txResult = await query(
      `SELECT id, user_id, plan_id FROM payment_transactions WHERE provider_transaction_id = $1`,
      [TransactionID]
    )

    if (txResult.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const tx = txResult.rows[0]

    if (ResultCode === 0 || ResultCode === '0') {
      await query(
        `UPDATE payment_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
        [tx.id]
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
              plan_id = $2, status = 'active', expires_at = $3,
              provider = 'azampesa', transaction_id = $4, amount = $5
            WHERE id = $1`,
            [existingSub.rows[0].id, plan.slug, expiresAt, TransactionID, Amount]
          )
        } else {
          const tierMapping: Record<string, string> = {
            free: 'free', basic: 'premium', pro: 'premium', institution: 'enterprise'
          }
          await query(
            `INSERT INTO subscriptions (user_id, tier, status, plan_id, expires_at, provider, transaction_id, amount, currency)
             VALUES ($1, $2, 'active', $3, $4, 'azampesa', $5, $6, 'TZS')`,
            [tx.user_id, tierMapping[plan.slug] || 'premium', tx.plan_id, expiresAt, TransactionID, Amount]
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
        [JSON.stringify(ResultDesc || 'Payment failed'), tx.id]
      )
      return NextResponse.json({ success: false, message: ResultDesc || 'Payment failed' })
    }
  } catch (err) {
    console.error('Payment callback error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
