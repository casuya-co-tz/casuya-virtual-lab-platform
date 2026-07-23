import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const result = await query(
      `SELECT p.full_name, l.title, l.subject, lp.status, lp.score, lp.last_server_ts
       FROM lab_progress lp
       JOIN profiles p ON p.id = lp.student_id
       JOIN labs l ON l.id = lp.lab_id
       ORDER BY lp.last_server_ts DESC NULLS LAST
       LIMIT 20`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
