import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage } from '@/lib/api-tracker'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await validateApiKey(req.headers.get('authorization'))
  if (!auth) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  try {
    const result = await query(
      `SELECT l.id, l.title, l.title_sw, l.subject, l.description, l.version, l.created_at,
              st.title AS subtopic, t.title AS topic, s.name AS subject_name
       FROM labs l
       LEFT JOIN subtopics st ON st.id = l.subtopic_id
       LEFT JOIN topics t ON t.id = st.topic_id
       LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE l.id = $1 AND l.is_published = true`,
      [params.id]
    )

    await trackApiUsage(auth.credentialId, `/api/v1/labs/${params.id}`, result.rows.length > 0 ? 200 : 404, req.headers.get('x-forwarded-for') || undefined)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
