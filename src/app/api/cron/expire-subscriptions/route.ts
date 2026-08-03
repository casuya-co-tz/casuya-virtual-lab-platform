import { NextRequest, NextResponse } from 'next/server'
import { transaction } from '@/lib/db'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { expired } = await transaction(async (q) => {
      const res = await q(
        `UPDATE subscriptions SET status = 'expired', tier = 'free', plan_id = NULL
         WHERE status = 'active' AND expires_at < NOW()
         RETURNING id, user_id, tier`
      )

      const userIds = res.rows.map((r: { user_id: string }) => r.user_id)
      if (userIds.length > 0) {
        await q(
          `UPDATE developer_profiles SET plan_id = (SELECT id FROM pricing_plans WHERE slug = 'dev_free')
           WHERE id = ANY($1::uuid[]) AND plan_id IS NOT NULL`,
          [userIds]
        )
      }

      return { expired: res.rows }
    })

    return NextResponse.json({
      success: true,
      expired_count: expired.length,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Expiry cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
