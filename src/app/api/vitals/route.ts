import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromSession } from '@/lib/auth-guard'
import { SimpleRateLimiter } from '@/lib/rate-limiter'
import { getClientIp } from '@/lib/client-ip'

const ALLOWED_METRICS = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'])
const vitalsLimiter = new SimpleRateLimiter(60000, 120)

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
    const ip = getClientIp(req.headers.get('x-forwarded-for'), req.ip)
    const rateCheck = vitalsLimiter.check(ip, '/api/vitals')
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { metric_name, metric_value, rating, page_url, student_id, lab_id } = body

    if (!metric_name || metric_value === undefined) {
      return NextResponse.json({ error: 'metric_name and metric_value required' }, { status: 400 })
    }
    if (!ALLOWED_METRICS.has(String(metric_name))) {
      return NextResponse.json({ error: 'Invalid metric_name' }, { status: 400 })
    }
    const numericValue = Number(metric_value)
    if (Number.isNaN(numericValue) || numericValue < 0 || numericValue > 600000) {
      return NextResponse.json({ error: 'Invalid metric_value' }, { status: 400 })
    }

    const sessionUserId = await getUserIdFromSession()
    const resolvedStudentId = sessionUserId || student_id || null

    await query(
      `INSERT INTO web_vitals (student_id, lab_id, metric_name, metric_value, rating, page_url, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        resolvedStudentId,
        lab_id || null,
        metric_name,
        numericValue,
        rating || null,
        typeof page_url === 'string' ? page_url.slice(0, 500) : null,
        req.headers.get('user-agent')?.slice(0, 500) || null,
      ]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Vitals POST Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
