import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function getUserId(): string | null {
  const cookieStore = cookies()
  const sid = cookieStore.get('sid')
  return sid?.value || null
}

export async function GET() {
  const userId = getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT lp.*, l.title, l.subject
       FROM lab_progress lp
       JOIN labs l ON l.id = lp.lab_id
       WHERE lp.student_id = $1
       ORDER BY lp.last_server_ts DESC NULLS LAST`,
      [userId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userId = getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { lab_id, status, score, completion_data } = await req.json()
    const result = await query(
      `INSERT INTO lab_progress (student_id, lab_id, status, score, completion_data, last_server_ts)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (student_id, lab_id)
       DO UPDATE SET status = COALESCE($3, lab_progress.status),
                     score = COALESCE($4, lab_progress.score),
                     completion_data = COALESCE($5::jsonb, lab_progress.completion_data),
                     sync_version = lab_progress.sync_version + 1,
                     last_server_ts = NOW()
       RETURNING *`,
      [userId, lab_id, status || 'in_progress', score || 0, completion_data ? JSON.stringify(completion_data) : null]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
