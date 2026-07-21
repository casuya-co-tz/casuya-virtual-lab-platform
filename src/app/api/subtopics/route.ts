import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
