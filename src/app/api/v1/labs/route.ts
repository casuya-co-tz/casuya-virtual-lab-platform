import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage } from '@/lib/api-tracker'

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get('authorization'))
  const { searchParams } = new URL(req.url)

  try {
    const subject = searchParams.get('subject')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    let sql = `
      SELECT l.id, l.title, l.title_sw, l.subject, l.description, l.version, l.created_at,
             st.title AS subtopic, t.title AS topic, s.name AS subject_name
      FROM labs l
      LEFT JOIN subtopics st ON st.id = l.subtopic_id
      LEFT JOIN topics t ON t.id = st.topic_id
      LEFT JOIN subjects s ON s.id = t.subject_id
      WHERE l.is_published = true
    `
    const params: unknown[] = []

    if (subject) {
      params.push(subject)
      sql += ` AND l.subject = $${params.length}`
    }

    sql += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)

    const countSql = subject
      ? 'SELECT COUNT(*) FROM labs WHERE is_published = true AND subject = $1'
      : 'SELECT COUNT(*) FROM labs WHERE is_published = true'
    const countParams = subject ? [subject] : []
    const countResult = await query(countSql, countParams)

    if (auth) {
      await trackApiUsage(auth.credentialId, '/api/v1/labs', 200, req.headers.get('x-forwarded-for') || undefined)
    }

    return NextResponse.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    })
  } catch {
    if (auth) {
      await trackApiUsage(auth.credentialId, '/api/v1/labs', 500, req.headers.get('x-forwarded-for') || undefined)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
