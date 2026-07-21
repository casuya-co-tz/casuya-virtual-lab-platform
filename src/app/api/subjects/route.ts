import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await query(
      `SELECT s.id, s.name, s.name_sw, s.icon, s.sort_order,
              json_agg(
                json_build_object(
                  'id', t.id,
                  'title', t.title,
                  'title_sw', t.title_sw,
                  'sort_order', t.sort_order,
                  'subtopics', (SELECT json_agg(
                    json_build_object(
                      'id', st.id,
                      'title', st.title,
                      'title_sw', st.title_sw,
                      'sort_order', st.sort_order
                    ) ORDER BY st.sort_order
                  ) FROM subtopics st WHERE st.topic_id = t.id)
                ) ORDER BY t.sort_order
              ) AS topics
       FROM subjects s
       LEFT JOIN topics t ON t.subject_id = s.id
       GROUP BY s.id, s.name, s.name_sw, s.icon, s.sort_order
       ORDER BY s.sort_order`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
