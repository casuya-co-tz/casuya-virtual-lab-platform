import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'
import { mobileCheckout, PROVIDER_MAP, formatAccountNumber } from '@/lib/azampay'

export async function POST(req: Request) {
  try {
    const userId = await requireAuth()
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await req.json()
    const { plan_id, phone, provider: rawProvider } = body

    if (!plan_id || !phone || !rawProvider) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 })
    }

    const provider = PROVIDER_MAP[rawProvider.toLowerCase()]
    if (!provider) {
      return NextResponse.json({
        error: 'INVALID_PROVIDER',
        valid: ['Mpesa', 'Airtel', 'Tigo', 'Halopesa', 'Azampesa'],
        message: 'TTCL is not supported by AzamPay. Please use Vodacom, Airtel, Mixx by Yas, Halopesa, or Azampesa.',
      }, { status: 400 })
    }

    const planResult = await query(
      'SELECT * FROM pricing_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    )

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'PLAN_NOT_FOUND' }, { status: 404 })
    }

    const plan = planResult.rows[0]

    const existingSub = await query(
      `SELECT s.id, s.status, pp.slug AS current_plan_slug
       FROM subscriptions s
       LEFT JOIN pricing_plans pp ON pp.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active'
       LIMIT 1`,
      [userId]
    )

    const PLAN_ORDER = ['free', 'basic', 'pro', 'institution']
    const currentIdx = existingSub.rows.length > 0
      ? PLAN_ORDER.indexOf(existingSub.rows[0].current_plan_slug || 'free')
      : 0
    const targetIdx = PLAN_ORDER.indexOf(plan.slug)

    if (targetIdx >= 0 && targetIdx < currentIdx) {
      return NextResponse.json({ error: 'DOWNGRADE_NOT_ALLOWED', message: 'You cannot downgrade to a lower plan.' }, { status: 400 })
    }

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
      [userId, plan_id, plan.price, plan.currency, provider.toLowerCase(), JSON.stringify({ phone })]
    )

    const transactionId = txResult.rows[0].id

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/azampesa/callback`

    const gatewayResult = await mobileCheckout({
      amount: String(plan.price),
      accountNumber: formatAccountNumber(phone),
      externalId: transactionId,
      provider,
      currency: plan.currency,
      callbackUrl,
    })

    if (gatewayResult.success && gatewayResult.transactionId) {
      try {
        await query(
          `UPDATE payment_transactions SET provider_transaction_id = $1, metadata = jsonb_set(COALESCE(metadata, '{}'), '{gateway_ref}', $2::jsonb) WHERE id = $3`,
          [gatewayResult.transactionId, JSON.stringify(gatewayResult.transactionId), transactionId]
        )
      } catch (err) {
        console.error('Failed to persist provider transaction id:', err)
      }
    }

    if (!gatewayResult.success) {
      return NextResponse.json({
        success: false,
        transaction_id: transactionId,
        error: gatewayResult.message || 'Payment initiation failed',
      }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      message: `Payment of TSh ${plan.price.toLocaleString()} initiated. Check your phone for the prompt.`,
      plan: { name: plan.name, name_sw: plan.name_sw, price: plan.price, currency: plan.currency },
    }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
