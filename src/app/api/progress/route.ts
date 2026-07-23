import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')
  return sid?.value || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT lp.*, l.title, l.title_sw, l.subject
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
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { lab_id, status, score, completion_data } = await req.json()

    if (!lab_id || typeof lab_id !== 'string') {
      return NextResponse.json({ error: 'Invalid lab_id' }, { status: 400 })
    }

    const validStatuses = ['not_started', 'in_progress', 'completed']
    const statusValue = validStatuses.includes(status) ? status : 'in_progress'
    const scoreValue = typeof score === 'number' ? score : 0

    let queryText: string
    let queryParams: unknown[]

    if (statusValue === 'in_progress') {
      queryText = `INSERT INTO lab_progress (student_id, lab_id, status, score, completion_data, started_at, last_server_ts)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW())
       ON CONFLICT (student_id, lab_id)
       DO UPDATE SET status = COALESCE($3, lab_progress.status),
                     score = COALESCE($4, lab_progress.score),
                     completion_data = COALESCE($5::jsonb, lab_progress.completion_data),
                     started_at = COALESCE(lab_progress.started_at, NOW()),
                     sync_version = lab_progress.sync_version + 1,
                     last_server_ts = NOW()
       RETURNING *`
      queryParams = [userId, lab_id, statusValue, scoreValue, completion_data ? JSON.stringify(completion_data) : null]
    } else if (statusValue === 'completed') {
      queryText = `INSERT INTO lab_progress (student_id, lab_id, status, score, completion_data, started_at, completed_at, last_server_ts)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW(), NOW())
       ON CONFLICT (student_id, lab_id)
       DO UPDATE SET status = COALESCE($3, lab_progress.status),
                     score = COALESCE($4, lab_progress.score),
                     completion_data = COALESCE($5::jsonb, lab_progress.completion_data),
                     started_at = COALESCE(lab_progress.started_at, NOW()),
                     completed_at = NOW(),
                     sync_version = lab_progress.sync_version + 1,
                     last_server_ts = NOW()
       RETURNING *`
      queryParams = [userId, lab_id, statusValue, scoreValue, completion_data ? JSON.stringify(completion_data) : null]
    } else {
      queryText = `INSERT INTO lab_progress (student_id, lab_id, status, score, completion_data, last_server_ts)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (student_id, lab_id)
       DO UPDATE SET status = COALESCE($3, lab_progress.status),
                     score = COALESCE($4, lab_progress.score),
                     completion_data = COALESCE($5::jsonb, lab_progress.completion_data),
                     sync_version = lab_progress.sync_version + 1,
                     last_server_ts = NOW()
       RETURNING *`
      queryParams = [userId, lab_id, statusValue, scoreValue, completion_data ? JSON.stringify(completion_data) : null]
    }

    const result = await query(queryText, queryParams)
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
