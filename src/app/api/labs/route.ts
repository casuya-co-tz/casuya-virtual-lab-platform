import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  try {
    const result = await query(
      `SELECT l.id, l.title, l.subject, l.is_published, l.version, l.created_at,
              s.name AS subject_name, st.title AS subtopic_title, t.title AS topic_title,
              p.full_name AS creator_name
       FROM labs l
       LEFT JOIN subtopics st ON st.id = l.subtopic_id
       LEFT JOIN topics t ON t.id = st.topic_id
       LEFT JOIN subjects s ON s.id = t.subject_id
       LEFT JOIN profiles p ON p.id = l.created_by
       ORDER BY l.created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const result = await query(
      `INSERT INTO labs (subtopic_id, title, title_sw, description, subject, html_threejs_code, is_published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [body.subtopic_id, body.title, body.title_sw, body.description, body.subject, body.html_threejs_code || null, body.is_published || false, userId]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
