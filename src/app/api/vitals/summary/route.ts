import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function GET() {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT wv.id, wv.metric_name, wv.metric_value, wv.rating, wv.page_url, wv.created_at
       FROM web_vitals wv
       JOIN developer_profiles dp ON dp.id = wv.student_id
       WHERE wv.student_id = $1
       ORDER BY wv.created_at DESC LIMIT 100`,
      [userId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
