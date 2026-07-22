import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ data: [], total: 0 })
    }

    const term = `%${q.trim()}%`
    const result = await query(
      `SELECT l.id, l.title, l.title_sw, l.subject, l.description,
              st.title AS subtopic, t.title AS topic
       FROM labs l
       LEFT JOIN subtopics st ON st.id = l.subtopic_id
       LEFT JOIN topics t ON t.id = st.topic_id
       WHERE l.is_published = true
         AND (l.title ILIKE $1 OR l.title_sw ILIKE $1 OR l.description ILIKE $1 OR st.title ILIKE $1)
       ORDER BY l.created_at DESC
       LIMIT 20`,
      [term]
    )

    return NextResponse.json({ data: result.rows, total: result.rows.length })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
