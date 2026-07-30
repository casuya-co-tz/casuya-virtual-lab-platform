import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function GET() {
  try {
    const userId = await requireAuth()
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const result = await query(
      `SELECT s.*, pp.name, pp.name_sw, pp.slug, pp.price, pp.currency
       FROM subscriptions s
       LEFT JOIN pricing_plans pp ON pp.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ subscription: null, plan: null }, { status: 200 })
    }

    const sub = result.rows[0]
    return NextResponse.json({
      subscription: {
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        expires_at: sub.expires_at,
        billing_cycle: sub.billing_cycle,
        created_at: sub.created_at,
      },
      plan: sub.slug ? {
        slug: sub.slug,
        name: sub.name,
        name_sw: sub.name_sw,
        price: sub.price,
        currency: sub.currency,
      } : null,
    }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
