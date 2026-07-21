import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('sid')?.value || null
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { company_or_school } = await req.json()
    const result = await query(
      `INSERT INTO developer_profiles (id, company_or_school, api_tier, monthly_request_limit)
       VALUES ($1, $2, 'free', 5000)
       ON CONFLICT (id) DO UPDATE SET company_or_school = $2
       RETURNING *`,
      [userId, company_or_school || 'Independent']
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
