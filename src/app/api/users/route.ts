import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const result = await query(
      `SELECT p.id, p.full_name, p.role, p.language, p.created_at, u.email
       FROM profiles p
       JOIN auth.users u ON u.id = p.id
       ORDER BY p.created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { id, role } = await req.json()
    const validRoles = ['admin', 'student', 'developer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin, student, or developer' }, { status: 400 })
    }
    const result = await query(
      'UPDATE profiles SET role = $1 WHERE id = $2 RETURNING id, full_name, role, language',
      [role, id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
