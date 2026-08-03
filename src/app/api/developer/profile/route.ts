import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET() {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(
      `SELECT dp.id, dp.company_or_school, dp.api_tier, dp.monthly_request_limit, dp.plan_id, dp.created_at,
              pp.name AS plan_name, pp.slug AS plan_slug, pp.max_api_keys, pp.rate_limit_per_min
       FROM developer_profiles dp
       LEFT JOIN pricing_plans pp ON pp.id = dp.plan_id
       WHERE dp.id = $1`,
      [developerId]
    )
    if (result.rows.length === 0) return NextResponse.json(null)
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
