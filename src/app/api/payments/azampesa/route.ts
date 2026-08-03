import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'
import { mobileCheckout, PROVIDER_MAP, formatAccountNumber } from '@/lib/azampay'

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { phone, plan_id, provider: rawProvider } = await req.json()
    if (!phone || !plan_id) {
      return NextResponse.json({ error: 'Phone and plan_id required' }, { status: 400 })
    }

    const provider = PROVIDER_MAP[(rawProvider || 'mpesa').toLowerCase()]
    if (!provider) return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    const planResult = await query(
      'SELECT id, price, currency FROM pricing_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    )
    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    const plan = planResult.rows[0]

    if (!process.env.AZAMPESA_APP_NAME || !process.env.AZAMPESA_CLIENT_ID) {
      return NextResponse.json({
        success: false,
        error: 'Payment gateway not configured',
      }, { status: 503 })
    }

    const txResult = await query(
      `INSERT INTO payment_transactions (user_id, plan_id, amount, currency, provider, status, metadata)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING id`,
      [userId, plan.id, plan.price, plan.currency || 'TZS', provider.toLowerCase(), JSON.stringify({ phone, source: 'payments_api' })]
    )

    const transactionId = txResult.rows[0].id

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/azampesa/callback`

    const gatewayResult = await mobileCheckout({
      amount: String(plan.price),
      accountNumber: formatAccountNumber(phone),
      externalId: transactionId,
      provider,
      currency: plan.currency || 'TZS',
      callbackUrl,
    })

    if (gatewayResult.success && gatewayResult.transactionId) {
      try {
        await query(
          `UPDATE payment_transactions SET provider_transaction_id = $1 WHERE id = $2`,
          [gatewayResult.transactionId, transactionId]
        )
      } catch (err) {
        console.error('Failed to persist provider transaction id:', err)
      }
    }

    if (!gatewayResult.success) {
      return NextResponse.json({
        success: false, transaction_id: transactionId,
        error: gatewayResult.message || 'Payment initiation failed',
      }, { status: 502 })
    }

    return NextResponse.json({
      success: true, transaction_id: transactionId,
      message: 'Payment initiated. Check your phone.',
      amount: plan.price, phone,
    })
  } catch (err) {
    console.error('Payment error:', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}

export async function GET() {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      'SELECT id, amount, currency, provider, status, created_at FROM payment_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
