import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET(req: NextRequest) {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || '7d'
  const days = period === '30d' ? 30 : period === '90d' ? 90 : 7

  try {
    const credentials = await query(
      `SELECT id FROM api_credentials WHERE developer_id = $1`,
      [developerId]
    )
    const credIds = credentials.rows.map((c: { id: string }) => c.id)
    if (credIds.length === 0) return NextResponse.json({ metrics: {}, timeline: [], topEndpoints: [] })

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const usage = await query(
      `SELECT endpoint, status_code, COUNT(*) as count
       FROM api_usage WHERE credential_id = ANY($1) AND accessed_at >= $2
       GROUP BY endpoint, status_code ORDER BY count DESC`,
      [credIds, since]
    )

    const timeline = await query(
      `SELECT DATE(accessed_at) as day, COUNT(*) as requests
       FROM api_usage WHERE credential_id = ANY($1) AND accessed_at >= $2
       GROUP BY DATE(accessed_at) ORDER BY day`,
      [credIds, since]
    )

    const totalRequests = usage.rows.reduce((sum: number, r: { count: string }) => sum + parseInt(r.count), 0)
    const errorRequests = usage.rows
      .filter((r: { status_code: number }) => r.status_code >= 400)
      .reduce((sum: number, r: { count: string }) => sum + parseInt(r.count), 0)

    return NextResponse.json({
      metrics: {
        total_requests: totalRequests,
        error_rate: totalRequests > 0 ? Math.round((errorRequests / totalRequests) * 10000) / 100 : 0,
        period_days: days,
      },
      timeline: timeline.rows,
      topEndpoints: usage.rows.slice(0, 20),
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
