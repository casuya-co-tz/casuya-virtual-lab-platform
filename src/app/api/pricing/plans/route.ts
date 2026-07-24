import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userType = searchParams.get('user_type') || 'standard'

    const result = await query(
      'SELECT * FROM pricing_plans WHERE is_active = true ORDER BY sort_order ASC'
    )

    const targetedPlans = result.rows.filter((p: any) => p.user_type === userType)

    return NextResponse.json(targetedPlans, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: 'DB_FETCH_FAILURE', details: err.message }, { status: 500 })
  }
}
