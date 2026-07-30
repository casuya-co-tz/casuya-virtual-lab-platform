import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserIdFromSession } from '@/lib/auth-guard'

export async function POST(req: Request) {
  const userId = await getUserIdFromSession()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const profileResult = await query('SELECT role FROM profiles WHERE id = $1', [userId])
    const currentRole = profileResult.rows[0]?.role

    const { company_or_school } = await req.json()
    const result = await query(
      `INSERT INTO developer_profiles (id, company_or_school, api_tier, monthly_request_limit)
       VALUES ($1, $2, 'free', 5000)
       ON CONFLICT (id) DO UPDATE SET company_or_school = $2
       RETURNING *`,
      [userId, company_or_school || 'Independent']
    )

    if (currentRole === 'student') {
      await query("UPDATE profiles SET role = 'developer' WHERE id = $1", [userId])
      await query("UPDATE auth.users SET role = 'developer' WHERE id = $1", [userId])
      const cookieStore = await cookies()
      cookieStore.set('role', 'developer', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
