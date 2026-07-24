import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function POST(req: Request) {
  try {
    const userId = await requireAuth()
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await req.json()
    const { plan_id, phone, provider } = body

    if (!plan_id || !phone || !provider) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 })
    }

    if (!['azampesa', 'mpesa', 'tigopesa'].includes(provider)) {
      return NextResponse.json({ error: 'INVALID_PROVIDER' }, { status: 400 })
    }

    const planResult = await query(
      'SELECT * FROM pricing_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    )

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'PLAN_NOT_FOUND' }, { status: 404 })
    }

    const plan = planResult.rows[0]

    const txResult = await query(
      `INSERT INTO payment_transactions (user_id, plan_id, amount, currency, provider, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id`,
      [userId, plan_id, plan.price, plan.currency, provider]
    )

    const transactionId = txResult.rows[0].id

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      message: `Payment of TSh ${plan.price} initiated via ${provider}. Check your phone for the prompt.`,
      plan: {
        name: plan.name,
        name_sw: plan.name_sw,
        price: plan.price,
        currency: plan.currency,
      },
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: 'PAYMENT_EXCEPTION', details: err.message }, { status: 500 })
  }
}
