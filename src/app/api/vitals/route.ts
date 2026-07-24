import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await query(
      `SELECT
        metric_name,
        COUNT(*) as sample_count,
        ROUND(AVG(metric_value)::numeric, 2) as avg_value,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value)::numeric, 2) as p75,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value)::numeric, 2) as p95,
        CASE
          WHEN metric_name = 'LCP' THEN COUNT(*) FILTER (WHERE rating = 'good')
          ELSE 0
        END as good_count
       FROM web_vitals
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY metric_name`
    )

    return NextResponse.json({ metrics: result.rows })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { metric_name, metric_value, rating, page_url, student_id, lab_id } = body

    if (!metric_name || metric_value === undefined) {
      return NextResponse.json({ error: 'metric_name and metric_value required' }, { status: 400 })
    }

    await query(
      `INSERT INTO web_vitals (student_id, lab_id, metric_name, metric_value, rating, page_url, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [student_id || null, lab_id || null, metric_name, metric_value, rating || null, page_url || null, req.headers.get('user-agent') || null]
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
