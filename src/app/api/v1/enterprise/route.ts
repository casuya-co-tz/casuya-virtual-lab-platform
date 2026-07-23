import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const keyResult = await query(
      `SELECT ac.*, dp.api_tier
       FROM api_credentials ac
       JOIN developer_profiles dp ON dp.id = ac.developer_id
       WHERE ac.public_token = $1 AND ac.is_active = true`,
      [token]
    )

    if (keyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const key = keyResult.rows[0]
    if (key.api_tier !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise tier required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'labs'

    if (endpoint === 'labs') {
      const result = await query(
        `SELECT l.id, l.title, l.title_sw, l.description, l.subject, l.version, l.security_score,
                l.created_at, s.name AS subject_name
         FROM labs l
         LEFT JOIN subtopics st ON st.id = l.subtopic_id
         LEFT JOIN topics t ON t.id = st.topic_id
         LEFT JOIN subjects s ON s.id = t.subject_id
         WHERE l.is_published = true
         ORDER BY l.created_at DESC
         LIMIT 100`
      )
      return NextResponse.json({ labs: result.rows, tier: 'enterprise' })
    }

    if (endpoint === 'usage') {
      const result = await query(
        `SELECT endpoint, status_code, COUNT(*) as count
         FROM api_usage
         WHERE credential_id = $1
         GROUP BY endpoint, status_code
         ORDER BY count DESC
         LIMIT 50`,
        [key.id]
      )
      return NextResponse.json({ usage: result.rows, tier: 'enterprise' })
    }

    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
