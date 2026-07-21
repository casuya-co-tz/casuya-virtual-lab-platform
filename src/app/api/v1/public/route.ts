import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await query(
      `SELECT l.id, l.title, l.subject, l.version, l.created_at,
              s.name AS subject_name
       FROM labs l
       LEFT JOIN subjects s ON LOWER(s.name) = LOWER(l.subject)
       WHERE l.is_published = true
       ORDER BY l.created_at DESC
       LIMIT 20`
    )
    return NextResponse.json({
      labs: result.rows,
      tier: 'public',
      message: 'Free public API — no key required. Rate limit: 30 req/min.',
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
