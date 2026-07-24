import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const expired = await query(
      `UPDATE subscriptions SET status = 'expired', tier = 'free'
       WHERE status = 'active' AND expires_at < NOW()
       RETURNING id, user_id, tier`
    )

    const now = new Date()
    for (const sub of expired.rows) {
      const existingDev = await query(
        `SELECT id FROM developer_profiles WHERE id = $1 AND plan_id IS NOT NULL`,
        [sub.user_id]
      )
      if (existingDev.rows.length > 0) {
        await query(
          `UPDATE developer_profiles SET plan_id = (SELECT id FROM pricing_plans WHERE slug = 'dev_free') WHERE id = $1`,
          [sub.user_id]
        )
      }
    }

    return NextResponse.json({
      success: true,
      expired_count: expired.rows.length,
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error('Expiry cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
