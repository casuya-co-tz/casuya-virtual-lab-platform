import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getAuthUser(): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  const role = cookieStore.get('role')?.value
  if (!sid || !role) return null
  return { id: sid, role }
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { company_or_school } = await req.json()
    const result = await query(
      `INSERT INTO developer_profiles (id, company_or_school, api_tier, monthly_request_limit)
       VALUES ($1, $2, 'free', 5000)
       ON CONFLICT (id) DO UPDATE SET company_or_school = $2
       RETURNING *`,
      [user.id, company_or_school || 'Independent']
    )

    if (user.role === 'student') {
      await query("UPDATE profiles SET role = 'developer' WHERE id = $1", [user.id])
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
