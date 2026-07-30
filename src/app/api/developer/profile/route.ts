import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET() {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  try {
    const result = await query(
      `SELECT dp.*, pp.max_api_keys
       FROM developer_profiles dp
       LEFT JOIN pricing_plans pp ON pp.slug = dp.api_tier
       WHERE dp.id = $1`,
      [developerId]
    )
    if (result.rows.length === 0) return NextResponse.json(null)
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
