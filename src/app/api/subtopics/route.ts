import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  try {
    const result = await query(
      `SELECT st.id, st.title, st.title_sw, t.title AS topic_title, s.name AS subject_name
       FROM subtopics st
       JOIN topics t ON t.id = st.topic_id
       JOIN subjects s ON s.id = t.subject_id
       ORDER BY s.sort_order, t.sort_order, st.sort_order`
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('Failed to fetch subtopics:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { topic_id, title, title_sw, sort_order } = await req.json()
    if (!topic_id || !title || !title_sw) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, title_sw, sort_order`,
      [topic_id, title, title_sw, sort_order || 0]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { id, title, title_sw, sort_order } = await req.json()
    if (!id || !title || !title_sw) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `UPDATE subtopics SET title = $1, title_sw = $2, sort_order = $3
       WHERE id = $4
       RETURNING id, title, title_sw, sort_order`,
      [title, title_sw, sort_order || 0, id]
    )

    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing subtopic id' }, { status: 400 })

    const result = await query(
      `DELETE FROM subtopics WHERE id = $1 RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
