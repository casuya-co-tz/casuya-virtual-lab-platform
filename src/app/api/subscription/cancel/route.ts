import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAuth } from '@/lib/auth-guard'

export async function POST() {
  const userId = await requireAuth()
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const result = await query(
      `UPDATE subscriptions
       SET status = 'cancelled', updated_at = NOW()
       WHERE profile_id = $1 AND status = 'active'
       RETURNING id, tier, status, expires_at`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscription: result.rows[0],
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
